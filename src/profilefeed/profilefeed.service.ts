// src/profilefeed/profilefeed.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  // src/profilefeed/profilefeed.service.ts (replace findAllByFeedType)
  async findAllByFeedType(
    orgId: number,
    subjectUsername: string,
    feedType: string,
    viewerUsername: string,
  ): Promise<ProfileFeedItemDto[]> {
    this.assertValidFeedType(feedType);
    const subject = await this.getUser(subjectUsername);
    const viewer = await this.getUser(viewerUsername);
    await this.assertOrgExists(orgId);

    // viewer & subject must both be org members
    await this.assertSubjectIsOrgMember(orgId, viewer.id);
    await this.assertSubjectIsOrgMember(orgId, subject.id);
    const viewerMem = await this.getOrgMembership(orgId, viewer.id);

    let items: ProfileFeedItem[] = [];

    switch (feedType as FeedType) {
      case 'created': {
        items = await this.profileFeedRepository.find({
          where: {
            organization: { id: orgId },
            userCreated: { id: subject.id } as any,
          },
          order: { id: 'DESC' },
        });
        break;
      }
      case 'liked': {
        const likes = (await this.layerMemberRepo.manager
          .getRepository('Like')
          .find({
            where: {
              user: { id: subject.id },
              organization: { id: orgId },
            },
            relations: ['feedItem'],
            order: { id: 'DESC' },
          })) as any[];
        items = likes.map((l) => l.feedItem).filter(Boolean);
        break;
      }
      case 'reposted': {
        const reposts = (await this.layerMemberRepo.manager
          .getRepository('Repost')
          .find({
            where: {
              user: { id: subject.id },
              organization: { id: orgId },
            },
            relations: ['feedItem'],
            order: { id: 'DESC' },
          })) as any[];
        items = reposts.map((r) => r.feedItem).filter(Boolean);
        break;
      }
      case 'saved': {
        const saves = (await this.layerMemberRepo.manager
          .getRepository('Save')
          .find({
            where: {
              user: { id: subject.id },
              organization: { id: orgId },
            },
            relations: ['feedItem'],
            order: { id: 'DESC' },
          })) as any[];
        items = saves.map((s) => s.feedItem).filter(Boolean);
        break;
      }
    }

    // Layer lock filtering still applies
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

    if (feedType === 'created') {
      // unchanged: create a new post
      const feedItem = this.profileFeedRepository.create({
        ...dto,
        username: dto.username ?? username,
        organization: org as Organization,
        userCreated: user,
      });
      const saved = await this.profileFeedRepository.save(feedItem);
      return this.toDto(saved);
    }

    // --- interactions: liked|reposted|saved ---
    if (!dto.feedItemId) {
      throw new BadRequestException('feedItemId is required for this feedType');
    }
    const target = await this.profileFeedRepository.findOne({
      where: { id: dto.feedItemId, organization: { id: orgId } },
    });
    if (!target) throw new NotFoundException('Target feed item not found');

    switch (feedType as FeedType) {
      case 'liked': {
        const likeRepo = this.layerMemberRepo.manager.getRepository('Like');
        // upsert to avoid duplicate likes
        const existing = await likeRepo.findOne({
          where: {
            user: { id: user.id },
            feedItem: { id: target.id },
            organization: { id: orgId },
          },
        });
        if (!existing) {
          await likeRepo.save(
            likeRepo.create({
              user,
              feedItem: target,
              organization: org,
            }),
          );
        }
        return this.toDto(target);
      }
      case 'reposted': {
        const repo = this.layerMemberRepo.manager.getRepository('Repost');
        const existing = await repo.findOne({
          where: {
            user: { id: user.id },
            feedItem: { id: target.id },
            organization: { id: orgId },
          },
        });
        if (!existing) {
          await repo.save(
            repo.create({
              user,
              feedItem: target,
              organization: org,
            }),
          );
        }
        return this.toDto(target);
      }
      case 'saved': {
        const saveRepo = this.layerMemberRepo.manager.getRepository('Save');
        const existing = await saveRepo.findOne({
          where: {
            user: { id: user.id },
            feedItem: { id: target.id },
            organization: { id: orgId },
          },
        });
        if (!existing) {
          await saveRepo.save(
            saveRepo.create({
              user,
              feedItem: target,
              organization: org,
            }),
          );
        }
        return this.toDto(target);
      }
    }
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
    id: number, // treat as target feed item id for interactions
    feedType: string,
  ): Promise<void> {
    this.assertValidFeedType(feedType);
    const user = await this.getUser(username);
    await this.assertOrgExists(orgId);
    await this.assertSubjectIsOrgMember(orgId, user.id);

    if (feedType === 'created') {
      // delete the authored post (unchanged)
      const item = await this.profileFeedRepository.findOne({
        where: {
          id,
          organization: { id: orgId },
          userCreated: { id: user.id } as any,
        },
      });
      if (!item) throw new NotFoundException('Feed item not found');
      await this.profileFeedRepository.delete(item.id);
      return;
    }

    // interactions removal
    const target = await this.profileFeedRepository.findOne({
      where: { id, organization: { id: orgId } },
    });
    if (!target) throw new NotFoundException('Target feed item not found');

    if (feedType === 'liked') {
      const likeRepo = this.layerMemberRepo.manager.getRepository('Like');
      await likeRepo.delete({
        user: { id: user.id } as any,
        feedItem: { id: target.id } as any,
        organization: { id: orgId } as any,
      });
    } else if (feedType === 'reposted') {
      const repo = this.layerMemberRepo.manager.getRepository('Repost');
      await repo.delete({
        user: { id: user.id } as any,
        feedItem: { id: target.id } as any,
        organization: { id: orgId } as any,
      });
    } else if (feedType === 'saved') {
      const saveRepo = this.layerMemberRepo.manager.getRepository('Save');
      await saveRepo.delete({
        user: { id: user.id } as any,
        feedItem: { id: target.id } as any,
        organization: { id: orgId } as any,
      });
    }
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
