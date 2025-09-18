// src/profilefeed/profilefeed.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, FindOptionsWhere } from 'typeorm';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
import { Organization } from 'src/organization/organization.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
import { OrgRole } from 'src/organization/organization-member.entity';

type FeedType = 'created' | 'liked' | 'reposted' | 'saved';

const FEED_RELATION_MAP: Record<FeedType, keyof ProfileFeedItem> = {
  created: 'userCreated',
  liked: 'userLiked',
  reposted: 'userReposted',
  saved: 'userSaved',
};

@Injectable()
export class ProfileFeedService {
  constructor(
    @InjectRepository(ProfileFeedItem)
    private profileFeedRepository: Repository<ProfileFeedItem>,
    @InjectRepository(ProfileUser)
    private userRepository: Repository<ProfileUser>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private orgMemberRepo: Repository<OrganizationMember>,
    @InjectRepository(LinkedCardLayer)
    private layerRepo: Repository<LinkedCardLayer>,
    @InjectRepository(LayerMember)
    private layerMemberRepo: Repository<LayerMember>,
  ) {}

  // ---------- helpers ----------
  private assertValidFeedType(feedType: string): asserts feedType is FeedType {
    if (!['created', 'liked', 'reposted', 'saved'].includes(feedType)) {
      throw new BadRequestException(
        'Invalid feedType. Use one of: created|liked|reposted|saved',
      );
    }
  }
  private async getUser(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('ProfileUser not found');
    return user;
  }
  private async assertOrgExists(orgId: number) {
    const org = await this.orgRepository.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }
  // Optional: require the subject user to be a member of the org
  private async assertSubjectIsOrgMember(orgId: number, userId: number) {
    const m = await this.orgMemberRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m)
      throw new ForbiddenException('User is not a member of this organization');
  }

  private async getOrgMembership(orgId: number, userId: number) {
    const m = await this.orgMemberRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m)
      throw new ForbiddenException('User is not a member of this organization');
    return m;
  }

  private async filterByLayerLock(
    orgId: number,
    viewerId: number,
    items: ProfileFeedItem[],
    opts?: { viewerIsGuest?: boolean; authorUsername?: string },
  ): Promise<ProfileFeedItem[]> {
    const keys = Array.from(
      new Set(
        items.map((i) => i.layerKey).filter((k): k is number => k != null),
      ),
    );
    if (!keys.length) return opts?.viewerIsGuest ? [] : items;

    const layers = await this.layerRepo.find({
      where: { organization: { id: orgId }, key: In(keys) },
    });
    if (!layers.length) return opts?.viewerIsGuest ? [] : items;

    const layerByKey = new Map(layers.map((l) => [l.key, l]));
    const lockedIds = layers.filter((l) => !!l.isLocked).map((l) => l.id);

    const memberships = await this.layerMemberRepo.find({
      where: {
        layer: { id: In(layers.map((l) => l.id)) },
        user: { id: viewerId },
        isActive: true,
      },
      relations: ['layer'],
    });
    const allowedLayerIds = new Set(memberships.map((m) => m.layer.id));

    // If guest: must be member of the layer AND item must belong to a layer
    if (opts?.viewerIsGuest) {
      return items.filter((i) => {
        const layer =
          i.layerKey != null ? layerByKey.get(i.layerKey) : undefined;
        if (!layer) return false;
        return allowedLayerIds.has(layer.id);
      });
    }

    // Non-guest: respect locked layers (members only), otherwise ok
    return items.filter((i) => {
      const layer = i.layerKey != null ? layerByKey.get(i.layerKey) : undefined;
      if (!layer) return true;
      if (!layer.isLocked) return true;
      // locked: member OR (optional author fallback)
      if (opts?.authorUsername && i.username === opts.authorUsername)
        return true;
      return allowedLayerIds.has(layer.id);
    });
  }

  // ---------- CRUD ----------
  async findAll(orgId: number): Promise<ProfileFeedItem[]> {
    await this.assertOrgExists(orgId);
    return this.profileFeedRepository.find({
      where: { organization: { id: orgId } },
      order: { id: 'DESC' },
    });
  }

  async findOne(orgId: number, id: number): Promise<ProfileFeedItem> {
    await this.assertOrgExists(orgId);
    const item = await this.profileFeedRepository.findOne({
      where: { id, organization: { id: orgId } },
    });
    if (!item) throw new NotFoundException('ProfileFeed item not found');
    return item;
  }

  async findAllByFeedType(
    orgId: number,
    subjectUsername: string, // whose profile we’re viewing
    feedType: string,
    viewerUsername: string, // who is viewing
  ): Promise<ProfileFeedItemDto[]> {
    this.assertValidFeedType(feedType);
    const subject = await this.getUser(subjectUsername);
    const viewer = await this.getUser(viewerUsername);
    await this.assertOrgExists(orgId);

    // require viewer to be in org too (org-scoped profile)
    await this.assertSubjectIsOrgMember(orgId, viewer.id);
    // and subject present in org
    await this.assertSubjectIsOrgMember(orgId, subject.id);
    const viewerMem = await this.getOrgMembership(orgId, viewer.id);

    const relationKey = FEED_RELATION_MAP[feedType];
    const where: FindOptionsWhere<ProfileFeedItem> = {
      organization: { id: orgId },
      [relationKey]: { id: subject.id } as any,
    };

    const items = await this.profileFeedRepository.find({
      where,
      order: { id: 'DESC' },
    });

    const filtered = await this.filterByLayerLock(
      orgId,
      viewer.id,
      items,
      viewerMem.role === OrgRole.GUEST
        ? { viewerIsGuest: true }
        : { authorUsername: viewerUsername },
    );

    return filtered.map((i) => this.toDto(i));
  }

  async create(
    orgId: number,
    username: string,
    dto: CreateProfileFeedItemDto,
    feedType: string,
  ): Promise<ProfileFeedItemDto> {
    this.assertValidFeedType(feedType);
    const user = await this.getUser(username);
    const org = await this.assertOrgExists(orgId);
    await this.assertSubjectIsOrgMember(orgId, user.id);

    const relationKey = FEED_RELATION_MAP[feedType];

    const feedItem = this.profileFeedRepository.create({
      ...dto,
      username: dto.username ?? username,
      organization: org as Organization,
    });

    // set the correct relation (userCreated / userLiked / userReposted / userSaved)
    (feedItem as any)[relationKey] = user;

    const saved = await this.profileFeedRepository.save(feedItem);
    return this.toDto(saved);
  }

  async update(
    orgId: number,
    id: number,
    patch: Partial<ProfileFeedItemDto>,
  ): Promise<ProfileFeedItemDto> {
    await this.assertOrgExists(orgId);
    const existing = await this.profileFeedRepository.findOne({
      where: { id, organization: { id: orgId } },
    });
    if (!existing) throw new NotFoundException('ProfileFeed item not found');

    Object.assign(existing, patch);
    const saved = await this.profileFeedRepository.save(existing);
    return this.toDto(saved);
  }

  async delete(
    orgId: number,
    username: string,
    id: number,
    feedType: string,
  ): Promise<void> {
    this.assertValidFeedType(feedType);
    const user = await this.getUser(username);
    await this.assertOrgExists(orgId);
    await this.assertSubjectIsOrgMember(orgId, user.id);

    const relationKey = FEED_RELATION_MAP[feedType];

    const item = await this.profileFeedRepository.findOne({
      where: {
        id,
        organization: { id: orgId },
        [relationKey]: { id: user.id } as any,
      },
    });
    if (!item) throw new NotFoundException('Feed item not found');

    await this.profileFeedRepository.delete(item.id);
  }

  // ---------- mapping ----------
  private toDto(feedItem: ProfileFeedItem): ProfileFeedItemDto {
    return {
      id: feedItem.id,
      username: feedItem.username,
      title: feedItem.title,
      description: feedItem.description,
      image: feedItem.image,
      picture: feedItem.picture,
      text: feedItem.text,
      layerKey: feedItem.layerKey,
      lock: feedItem.lock,
      privacy: feedItem.privacy,
    };
  }
}
