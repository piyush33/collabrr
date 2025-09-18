// src/notification/notification.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Notification } from './notification.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed, Visibility } from '../homefeed/homefeed.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';

const MENTION_RE = /@(\w+)/g;

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(ProfileUser)
    private userRepository: Repository<ProfileUser>,
    @InjectRepository(Homefeed)
    private homefeedRepository: Repository<Homefeed>,
    @InjectRepository(OrganizationMember)
    private orgMemberRepo: Repository<OrganizationMember>,
    @InjectRepository(LayerMember)
    private layerMemberRepo: Repository<LayerMember>,
  ) {}

  // ---------- helpers ----------
  private async getUserByUsername(username: string) {
    const u = await this.userRepository.findOne({ where: { username } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }
  private async assertOrgMember(orgId: number, userId: number) {
    const m = await this.orgMemberRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m) throw new ForbiddenException('Not an organization member');
  }
  private async assertLayerMember(layerId: number, userId: number) {
    const m = await this.layerMemberRepo.findOne({
      where: { layer: { id: layerId }, user: { id: userId } },
    });
    if (!m) throw new ForbiddenException('Not a layer member');
  }

  // ---------- creation ----------
  /**
   * Always sets organization from the card's organization.
   * Optionally you could deduplicate (unique on type+item+target) if desired.
   */
  async createNotification(
    actor: ProfileUser,
    homefeedItem: Homefeed,
    type: string,
    targetUser: ProfileUser,
  ): Promise<Notification> {
    if (!homefeedItem?.organization) {
      throw new BadRequestException('Homefeed item missing organization');
    }
    const notification = this.notificationRepository.create({
      user: actor,
      homefeedItem,
      type,
      targetUser,
      organization: homefeedItem.organization,
    });
    return this.notificationRepository.save(notification);
  }

  async createLikeNotification(
    likingUser: ProfileUser,
    homefeedItem: Homefeed,
  ) {
    const targetUser = homefeedItem.createdBy;
    if (targetUser?.id && targetUser.id !== likingUser.id) {
      await this.createNotification(
        likingUser,
        homefeedItem,
        'liked',
        targetUser,
      );
    }
  }

  async createRepostNotification(
    repostingUser: ProfileUser,
    homefeedItem: Homefeed,
  ) {
    const targetUser = homefeedItem.createdBy;
    if (targetUser?.id && targetUser.id !== repostingUser.id) {
      await this.createNotification(
        repostingUser,
        homefeedItem,
        'reposted',
        targetUser,
      );
    }
  }

  // ---------- reads (scoped) ----------
  /**
   * Org notifications for a user (member-only).
   * Filters by organization and targetUser.
   */
  async getOrgUserNotifications(
    orgId: number,
    username: string,
  ): Promise<Notification[]> {
    const user = await this.getUserByUsername(username);
    await this.assertOrgMember(orgId, user.id);

    return this.notificationRepository.find({
      where: {
        organization: { id: orgId },
        targetUser: { id: user.id },
      },
      relations: ['homefeedItem', 'user', 'targetUser'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Layer notifications for a user (layer guests allowed).
   * Returns only notifications whose items are in the given layer and visible as LAYER.
   */
  async getLayerUserNotifications(
    layerId: number,
    username: string,
  ): Promise<Notification[]> {
    const user = await this.getUserByUsername(username);
    await this.assertLayerMember(layerId, user.id);

    return this.notificationRepository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.homefeedItem', 'h')
      .leftJoinAndSelect('n.user', 'actor')
      .leftJoinAndSelect('n.targetUser', 'target')
      .where('n.targetUserId = :userId', { userId: user.id })
      .andWhere('h.layerId = :layerId', { layerId })
      .andWhere('h.visibility = :vis', { vis: Visibility.LAYER })
      .orderBy('n.createdAt', 'DESC')
      .limit(100)
      .getMany();
  }

  // ---------- (optional) broadcast helper ----------
  /**
   * Example: notify followers/following (use only if you have an org-scoped follow model).
   * Commented out until you wire a proper follower repository.
   */
  // async createFollowedUserNotifications(mainUser: ProfileUser, homefeedItem: Homefeed, type: string) {
  //   // Ensure org scope here if you enable this
  // }

  /**
   * Create notifications for @username and @123 (card id) mentions
   * found across title/description/text. Only notifies active org members.
   */
  async createMentionNotifications(
    actor: ProfileUser,
    item: Homefeed,
  ): Promise<void> {
    // Re-read minimal fields to be safe
    const fresh = await this.homefeedRepository.findOne({
      where: { id: item.id },
      relations: ['organization', 'createdBy'],
    });
    if (!fresh?.organization?.id) return;

    const orgId = fresh.organization.id;

    const source =
      [fresh.title, fresh.description, fresh.text].filter(Boolean).join(' ') ??
      '';
    const tokens = Array.from(source.matchAll(MENTION_RE)).map((m) => m[1]);

    if (!tokens.length) return;

    const usernameTokens = Array.from(
      new Set(tokens.filter((t) => !/^\d+$/.test(t).valueOf())),
    );
    const cardIdTokens = Array.from(
      new Set(
        tokens
          .filter((t) => /^\d+$/.test(t))
          .map((s) => Number.parseInt(s, 10))
          .filter((n) => Number.isFinite(n)),
      ),
    );

    // Resolve @username → ProfileUser
    let usersByName: ProfileUser[] = [];
    if (usernameTokens.length) {
      usersByName = await this.userRepository.find({
        where: { username: In(usernameTokens) },
      });
    }

    // Resolve @123 → card author
    let usersByCard: ProfileUser[] = [];
    if (cardIdTokens.length) {
      const cards = await this.homefeedRepository.find({
        where: { id: In(cardIdTokens), organization: { id: orgId } },
        relations: ['createdBy', 'organization'],
      });
      usersByCard = cards
        .map((c) => c.createdBy)
        .filter((u): u is ProfileUser => !!u?.id);
    }

    // Dedupe users and ensure they’re active members of this org
    const candidateIds = Array.from(
      new Set(
        [...usersByName, ...usersByCard]
          .map((u) => u.id)
          .filter((id) => id && id !== actor.id),
      ),
    );

    if (!candidateIds.length) return;

    const activeMembers = await this.orgMemberRepo.find({
      where: {
        organization: { id: orgId },
        user: { id: In(candidateIds) },
        isActive: true,
      },
      relations: ['user'],
    });
    const allowedTargets = activeMembers
      .map((m) => m.user)
      .filter((u): u is ProfileUser => !!u?.id);

    await Promise.all(
      allowedTargets.map((u) =>
        this.createNotification(actor, fresh, 'mentioned', u),
      ),
    );
  }

  async getUnreadCount(orgId: number, username: string): Promise<number> {
    const viewer = await this.getUserByUsername(username);
    await this.assertOrgMember(orgId, viewer.id);

    return this.notificationRepository
      .createQueryBuilder('n')
      .where('n.organizationId = :orgId', { orgId })
      .andWhere('n.targetUserId = :uid', { uid: viewer.id }) // <-- targetUserId
      .andWhere('n.readAt IS NULL')
      .getCount();
  }

  async markAllRead(orgId: number, username: string): Promise<number> {
    const viewer = await this.getUserByUsername(username);
    await this.assertOrgMember(orgId, viewer.id);

    const { affected } = await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('organizationId = :orgId', { orgId })
      .andWhere('targetUserId = :uid', { uid: viewer.id }) // <-- targetUserId
      .andWhere('readAt IS NULL')
      .execute();

    return affected ?? 0;
  }

  async markOneRead(
    orgId: number,
    username: string,
    id: number,
  ): Promise<void> {
    const user = await this.getUserByUsername(username);
    await this.assertOrgMember(orgId, user.id);
    await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id })
      .andWhere('organizationId = :orgId', { orgId })
      .andWhere('targetUserId = :uid', { uid: user.id })
      .andWhere('readAt IS NULL')
      .execute();
  }
}
