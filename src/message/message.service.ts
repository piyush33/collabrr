// message.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(ProfileUser) private userRepo: Repository<ProfileUser>,
    @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
    @InjectRepository(OrganizationMember)
    private orgMemRepo: Repository<OrganizationMember>,
    @InjectRepository(LayerMember)
    private layerMemRepo: Repository<LayerMember>,
  ) {}

  // ---------- helpers ----------
  private async getUser(username: string) {
    const u = await this.userRepo.findOne({ where: { username } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  private async assertOrgMember(orgId: number, userId: number) {
    const m = await this.orgMemRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m) throw new ForbiddenException('Not an org member');
  }
  private async assertLayerMember(layerId: number, userId: number) {
    const m = await this.layerMemRepo.findOne({
      where: { layer: { id: layerId }, user: { id: userId } },
    });
    if (!m) throw new ForbiddenException('Not a layer member');
  }
  private usersOrdered(a: number, b: number) {
    return a < b ? [a, b] : [b, a];
  }

  // ---------- ORG DMs ----------
  async sendOrgMessage(
    orgId: number,
    senderUsername: string,
    recipientUsername: string,
    content: string,
  ): Promise<Message> {
    if (!content?.trim()) throw new BadRequestException('Empty message');
    const [sender, recipient] = await Promise.all([
      this.getUser(senderUsername),
      this.getUser(recipientUsername),
    ]);
    await Promise.all([
      this.assertOrgMember(orgId, sender.id),
      this.assertOrgMember(orgId, recipient.id),
    ]);

    const [a, b] = this.usersOrdered(sender.id, recipient.id);

    let convo = await this.convoRepo
      .createQueryBuilder('c')
      .where('c.organizationId = :orgId', { orgId })
      .andWhere(
        '((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))',
        { a, b },
      )
      .getOne();

    if (!convo) {
      convo = this.convoRepo.create({
        organization: { id: orgId } as any,
        user1: { id: a } as any,
        user2: { id: b } as any,
      });
      await this.convoRepo.save(convo);
    }

    const msg = this.messageRepo.create({
      sender,
      content,
      conversation: convo,
    });
    convo.lastMessageAt = new Date();
    await this.convoRepo.save(convo);
    return this.messageRepo.save(msg);
  }

  async getOrgConversationHistory(
    orgId: number,
    user1Username: string,
    user2Username: string,
  ): Promise<Message[]> {
    const [u1, u2] = await Promise.all([
      this.getUser(user1Username),
      this.getUser(user2Username),
    ]);
    await Promise.all([
      this.assertOrgMember(orgId, u1.id),
      this.assertOrgMember(orgId, u2.id),
    ]);

    const [a, b] = this.usersOrdered(u1.id, u2.id);
    const convo = await this.convoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.messages', 'm')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('c.organizationId = :orgId', { orgId })
      .andWhere(
        '((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))',
        { a, b },
      )
      .getOne();

    if (!convo) throw new NotFoundException('Conversation not found');
    return (convo.messages || []).sort(
      (x, y) => +new Date(x.createdAt) - +new Date(y.createdAt),
    );
  }

  async getOrgRecentConversations(
    orgId: number,
    username: string,
  ): Promise<Conversation[]> {
    const me = await this.getUser(username);
    await this.assertOrgMember(orgId, me.id);

    const convos = await this.convoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.messages', 'm')
      .leftJoinAndSelect('c.user1', 'u1')
      .leftJoinAndSelect('c.user2', 'u2')
      .where('c.organizationId = :orgId', { orgId })
      .andWhere('(c.user1Id = :me OR c.user2Id = :me)', { me: me.id })
      .orderBy('c.lastMessageAt', 'DESC')
      .getMany();

    return convos;
  }

  // ---------- LAYER DMs (no org membership required) ----------
  async sendLayerMessage(
    layerId: number,
    senderUsername: string,
    recipientUsername: string,
    content: string,
  ): Promise<Message> {
    if (!content?.trim()) throw new BadRequestException('Empty message');
    const [sender, recipient] = await Promise.all([
      this.getUser(senderUsername),
      this.getUser(recipientUsername),
    ]);
    await Promise.all([
      this.assertLayerMember(layerId, sender.id),
      this.assertLayerMember(layerId, recipient.id),
    ]);

    const [a, b] = this.usersOrdered(sender.id, recipient.id);

    let convo = await this.convoRepo
      .createQueryBuilder('c')
      .where('c.layerId = :layerId', { layerId })
      .andWhere(
        '((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))',
        { a, b },
      )
      .getOne();

    if (!convo) {
      convo = this.convoRepo.create({
        layer: { id: layerId } as any,
        user1: { id: a } as any,
        user2: { id: b } as any,
      });
      await this.convoRepo.save(convo);
    }

    const msg = this.messageRepo.create({
      sender,
      content,
      conversation: convo,
    });
    convo.lastMessageAt = new Date();
    await this.convoRepo.save(convo);
    return this.messageRepo.save(msg);
  }

  async getLayerConversationHistory(
    layerId: number,
    user1Username: string,
    user2Username: string,
  ): Promise<Message[]> {
    const [u1, u2] = await Promise.all([
      this.getUser(user1Username),
      this.getUser(user2Username),
    ]);
    await Promise.all([
      this.assertLayerMember(layerId, u1.id),
      this.assertLayerMember(layerId, u2.id),
    ]);

    const [a, b] = this.usersOrdered(u1.id, u2.id);
    const convo = await this.convoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.messages', 'm')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('c.layerId = :layerId', { layerId })
      .andWhere(
        '((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))',
        { a, b },
      )
      .getOne();

    if (!convo) throw new NotFoundException('Conversation not found');
    return (convo.messages || []).sort(
      (x, y) => +new Date(x.createdAt) - +new Date(y.createdAt),
    );
  }

  async getLayerRecentConversations(
    layerId: number,
    username: string,
  ): Promise<Conversation[]> {
    const me = await this.getUser(username);
    await this.assertLayerMember(layerId, me.id);

    const convos = await this.convoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.messages', 'm')
      .leftJoinAndSelect('c.user1', 'u1')
      .leftJoinAndSelect('c.user2', 'u2')
      .where('c.layerId = :layerId', { layerId })
      .andWhere('(c.user1Id = :me OR c.user2Id = :me)', { me: me.id })
      .orderBy('c.lastMessageAt', 'DESC')
      .getMany();

    return convos;
  }
}
