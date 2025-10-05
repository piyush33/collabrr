// src/homefeed/homefeed.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';

import { Homefeed, Visibility } from './homefeed.entity';
import { UserInteraction } from './user-interaction.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { TeamMember } from 'src/organization/team-member.entity';
import { TeamCardAccess } from 'src/organization/team-card-access.entity';
import { Team } from 'src/organization/team.entity';

import { LinkedCardLayer } from './linked-card-layer.entity';
import { LayerMember } from './layer-member.entity';
import { Organization } from 'src/organization/organization.entity';
import { CreateHomefeedDto } from './dto/create-homefeed.dto';
import {
  OrgRole,
  OrganizationMember,
} from 'src/organization/organization-member.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class HomefeedService {
  constructor(
    @InjectRepository(Homefeed)
    private readonly homefeedRepository: Repository<Homefeed>,
    @InjectRepository(UserInteraction)
    private readonly userInteractionRepository: Repository<UserInteraction>,
    @InjectRepository(ProfileUser)
    private readonly profileUserRepository: Repository<ProfileUser>,

    @InjectRepository(OrganizationMember)
    private readonly orgMemberRepo: Repository<OrganizationMember>,

    @InjectRepository(TeamMember)
    private readonly teamMemberRepo: Repository<TeamMember>,
    @InjectRepository(TeamCardAccess)
    private readonly teamCardAccessRepo: Repository<TeamCardAccess>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    @InjectRepository(LinkedCardLayer)
    private readonly layerRepo: Repository<LinkedCardLayer>,
    @InjectRepository(LayerMember)
    private readonly layerMemberRepo: Repository<LayerMember>,

    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly notifications: NotificationService,
  ) {}

  // ---------- helpers ----------

  // returns active membership (throws if not found)
  private async getOrgMembership(
    orgId: number,
    userId: number,
  ): Promise<OrganizationMember> {
    const m = await this.orgMemberRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m)
      throw new ForbiddenException(
        `Not an active member of this organization ${orgId}, ${userId}`,
      );
    return m;
  }

  // Force guests to see only items inside layers they belong to
  private restrictGuestToMyLayers(
    qb: SelectQueryBuilder<Homefeed>,
    userId: number,
  ) {
    const lmExists = qb
      .subQuery()
      .select('1')
      .from(LayerMember, 'lm')
      .where('lm.layerId = h.layerId')
      .andWhere('lm.userId = :userId')
      .andWhere('lm.isActive = true')
      .getQuery();

    qb.andWhere('h.layerId IS NOT NULL')
      .andWhere(`EXISTS (${lmExists})`)
      .setParameters({ ...qb.getParameters(), userId });

    return qb;
  }

  private async loadUser(username: string): Promise<ProfileUser> {
    const user = await this.profileUserRepository.findOne({
      where: { username },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async assertOrgMembership(orgId: number, userId: number) {
    console.log('data:', userId, orgId);

    const m = await this.orgMemberRepo.findOne({
      where: {
        organization: { id: orgId },
        user: { id: userId },
        isActive: true,
      },
    });
    if (!m) {
      throw new ForbiddenException(
        `Not an active member of this organization ${orgId}, ${userId}`,
      );
    }
  }

  /** Create or load a layer by (orgId, layerId or layerKey). */
  private async resolveOrUpsertLayer(
    orgId: number,
    authorId: number,
    layerId?: number,
    layerKey?: number,
    autoAddAuthorMember = true,
  ): Promise<LinkedCardLayer> {
    if (!layerId && !layerKey) {
      throw new BadRequestException('Provide layerId or layerKey');
    }

    if (layerId) {
      const found = await this.layerRepo.findOne({
        where: { id: layerId, organization: { id: orgId } },
      });
      if (!found) throw new BadRequestException('Layer not found in this org');
      return found;
    }

    const key = layerKey;
    let layer = await this.layerRepo.findOne({
      where: { key, organization: { id: orgId } },
    });
    if (layer) return layer;

    // Upsert with unique constraint race-safety
    try {
      layer = await this.layerRepo.save(
        this.layerRepo.create({
          key,
          organization: { id: orgId } as Organization,
          createdBy: { id: authorId } as ProfileUser,
        }),
      );
      if (autoAddAuthorMember) {
        await this.layerMemberRepo.save({
          layer: { id: layer.id } as any,
          user: { id: authorId } as any,
          isActive: true,
        });
      }
      return layer;
    } catch (e: any) {
      // Postgres unique violation
      if (e?.code === '23505') {
        const reread = await this.layerRepo.findOne({
          where: { key, organization: { id: orgId } },
        });
        if (!reread) throw new ConflictException('Layer upsert failed');
        return reread;
      }
      throw e;
    }
  }

  /** Reusable visibility predicate */
  private applyVisibilityClause(
    qb: SelectQueryBuilder<Homefeed>,
    userId: number,
  ) {
    qb.setParameters({ ...qb.getParameters(), userId });

    const teamMemberSub = qb
      .subQuery()
      .select('1')
      .from(TeamMember, 'tm')
      .where('tm.teamId = h.teamId')
      .andWhere('tm.userId = :userId')
      .andWhere('tm.isActive = true')
      .getQuery();

    const teamAclExists = qb
      .subQuery()
      .select('1')
      .from(TeamCardAccess, 'tca')
      .where('tca.homefeedId = h.id')
      .getQuery();

    const teamAclHasMe = qb
      .subQuery()
      .select('1')
      .from(TeamCardAccess, 'tca2')
      .where('tca2.homefeedId = h.id')
      .andWhere('tca2.userId = :userId')
      .getQuery();

    const layerMemberSub = qb
      .subQuery()
      .select('1')
      .from(LayerMember, 'lm')
      .where('lm.layerId = h.layerId')
      .andWhere('lm.userId = :userId')
      .andWhere('lm.isActive = true')
      .getQuery();

    // Is the layer locked?
    const layerLockedSub = qb
      .subQuery()
      .select('1')
      .from(LinkedCardLayer, 'ly1')
      .where('ly1.id = h.layerId')
      .andWhere('ly1.isLocked = true')
      .getQuery();

    // Is the layer unlocked (or NULL is treated as unlocked)?
    const layerUnlockedSub = qb
      .subQuery()
      .select('1')
      .from(LinkedCardLayer, 'ly2')
      .where('ly2.id = h.layerId')
      .andWhere('(ly2.isLocked IS DISTINCT FROM true)') // unlocked if not true
      .getQuery();

    qb.andWhere(
      new Brackets((b) => {
        // ORG-visible: visible to anyone in the org
        b.where('h.visibility = :orgVis', { orgVis: Visibility.ORG })

          // PRIVATE: only author
          .orWhere(
            new Brackets((p) => {
              p.where('h.visibility = :privateVis', {
                privateVis: Visibility.PRIVATE,
              }).andWhere('author.id = :userId');
            }),
          )

          // TEAM: must be team member; if ACL present -> must be allowlisted
          .orWhere(
            new Brackets((t) => {
              t.where('h.visibility = :teamVis', { teamVis: Visibility.TEAM })
                .andWhere(`EXISTS (${teamMemberSub})`)
                .andWhere(
                  new Brackets((acl) => {
                    acl
                      .where(`NOT EXISTS (${teamAclExists})`)
                      .orWhere(`EXISTS (${teamAclHasMe})`);
                  }),
                );
            }),
          )

          // LAYER:
          // - if locked: must be a member
          // - if unlocked: member OR author
          .orWhere(
            new Brackets((l) => {
              l.where('h.visibility = :layerVis', {
                layerVis: Visibility.LAYER,
              }).andWhere(
                new Brackets((v) => {
                  v.where(
                    `EXISTS (${layerLockedSub}) AND EXISTS (${layerMemberSub})`,
                  ).orWhere(
                    `EXISTS (${layerUnlockedSub}) AND (EXISTS (${layerMemberSub}) OR author.id = :userId)`,
                  );
                }),
              );
            }),
          );
      }),
    );

    return qb;
  }

  // --- helper: lock a layer and ensure members ---
  private async lockLayerAndEnsureMembers(
    orgId: number,
    layerId: number,
    memberIds: number[],
    authorId: number,
  ) {
    // include author by default
    const uniqueIds = Array.from(new Set([authorId, ...memberIds]));

    // verify all are active org members
    const rows = await this.orgMemberRepo.find({
      where: {
        organization: { id: orgId },
        user: { id: In(uniqueIds) },
        isActive: true,
      },
      relations: ['user'],
    });
    if (rows.length !== uniqueIds.length) {
      throw new BadRequestException(
        'All allowed members must be active members of the organization',
      );
    }

    await this.layerRepo.update({ id: layerId }, { isLocked: true });

    // add LayerMember rows if missing
    const existing = await this.layerMemberRepo.find({
      where: { layer: { id: layerId }, user: { id: In(uniqueIds) } },
      relations: ['user'],
    });
    const existingSet = new Set(existing.map((e) => e.user.id));
    const toCreate = uniqueIds
      .filter((id) => !existingSet.has(id))
      .map((id) =>
        this.layerMemberRepo.create({
          layer: { id: layerId } as any,
          user: { id } as any,
          isActive: true,
        }),
      );
    if (toCreate.length) await this.layerMemberRepo.save(toCreate);
  }

  // ---------- basic CRUD (org-scoped) ----------

  async findAll(activeOrgId: number, username: string): Promise<Homefeed[]> {
    const me = await this.loadUser(username);
    const mem = await this.getOrgMembership(activeOrgId, me.id);

    const qb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoin('h.createdBy', 'author')
      .where('h.organizationId = :orgId', { orgId: activeOrgId })
      .setParameters({ userId: me.id });

    this.applyVisibilityClause(qb, me.id);
    if (mem.role === OrgRole.GUEST) this.restrictGuestToMyLayers(qb, me.id);
    qb.orderBy('h.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(
    activeOrgId: number,
    id: number,
    username: string,
  ): Promise<Homefeed> {
    const me = await this.loadUser(username);
    const mem = await this.getOrgMembership(activeOrgId, me.id);

    const qb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.createdBy', 'author')
      .leftJoinAndSelect('h.team', 'team')
      .leftJoinAndSelect('h.layer', 'layer')
      .where('h.id = :id', { id })
      .andWhere('h.organizationId = :orgId', { orgId: activeOrgId })
      .setParameters({ userId: me.id });

    this.applyVisibilityClause(qb, me.id);
    if (mem.role === OrgRole.GUEST) this.restrictGuestToMyLayers(qb, me.id);

    const row = await qb.getOne();
    if (!row) throw new NotFoundException('Card not found or not accessible');
    return row;
  }

  /** Create a card. `dto` can include optional layerId/layerKey (for grouping) and teamId for TEAM visibility. */
  async create(
    orgId: number,
    username: string,
    dto: CreateHomefeedDto,
    opts?: { allowedMemberIds?: number[] }, // TEAM allowlist
  ): Promise<Homefeed> {
    const me = await this.loadUser(username);
    await this.assertOrgMembership(orgId, me.id);

    // --- resolve layer if provided, regardless of visibility ---
    const wantsLayer = !!dto.layerId || !!dto.layerKey;
    let layer: LinkedCardLayer | undefined = undefined;

    if (wantsLayer) {
      layer = await this.resolveOrUpsertLayer(
        orgId,
        me.id,
        dto.layerId,
        dto.layerKey,
        true,
      );
    }

    // If visibility is LAYER, enforce layer presence
    if (dto.visibility === Visibility.LAYER && !layer) {
      throw new BadRequestException(
        'Provide layerId or layerKey for LAYER visibility',
      );
    }

    // --- TEAM checks ---
    let team: Team | undefined;
    if (dto.visibility === Visibility.TEAM) {
      if (!dto.teamId)
        throw new BadRequestException('teamId required for TEAM visibility');
      team = await this.teamRepo.findOne({
        where: { id: dto.teamId, organization: { id: orgId } },
      });
      if (!team) throw new BadRequestException('Team not found in this org');
      const member = await this.teamMemberRepo.findOne({
        where: { team: { id: team.id }, user: { id: me.id }, isActive: true },
      });
      if (!member)
        throw new ForbiddenException('You are not a member of this team');
    }

    // If layer is (or will be) locked, only members can post
    if (layer && (layer.isLocked || dto.lock)) {
      const lm = await this.layerMemberRepo.findOne({
        where: { layer: { id: layer.id }, user: { id: me.id }, isActive: true },
      });
      if (!lm) {
        throw new ForbiddenException(
          'Only layer members can post to this locked layer',
        );
      }
    }

    // --- create post ---
    const entity = this.homefeedRepository.create({
      title: dto.title,
      description: dto.description,
      image: dto.image,
      picture: dto.picture,
      text: dto.text,
      weblink: dto.weblink,
      category: dto.category,
      username: username,
      visibility: dto.visibility ?? Visibility.ORG,
      organization: { id: orgId } as Organization,
      createdBy: { id: me.id } as ProfileUser,
      layer,
      team,
      phase: dto.phase ?? null,
      roleTypes: dto.roleTypes ?? [],
    });

    const saved = await this.homefeedRepository.save(entity);

    // If client asked to lock this layer now, do it and ensure members
    const allowedIds = dto.allowedMemberIds ?? opts?.allowedMemberIds ?? [];
    if (layer && dto.lock) {
      if (!allowedIds.length) {
        // include at least the author
        await this.lockLayerAndEnsureMembers(orgId, layer.id, [me.id], me.id);
      } else {
        await this.lockLayerAndEnsureMembers(
          orgId,
          layer.id,
          allowedIds,
          me.id,
        );
      }
    }

    // --- optional team ACL allowlist ---
    const allowIds = dto.allowedMemberIds ?? opts?.allowedMemberIds;
    if (dto.visibility === Visibility.TEAM && allowIds?.length) {
      const rows = await this.teamMemberRepo.find({
        where: {
          team: { id: saved.team!.id },
          user: { id: In(allowIds) },
          isActive: true,
        },
        relations: ['user'],
      });
      if (rows.length !== allowIds.length) {
        throw new BadRequestException(
          'Some users are not active members of this team',
        );
      }
      await this.teamCardAccessRepo.save(
        allowIds.map((uid) =>
          this.teamCardAccessRepo.create({
            homefeed: saved,
            user: { id: uid } as ProfileUser,
          }),
        ),
      );
    }

    try {
      await this.notifications.createMentionNotifications(me, saved);
    } catch (e) {
      // don’t block the post if notifications fail
      console.error('[mention notifications] failed:', e);
    }

    return saved;
  }

  async update(
    activeOrgId: number,
    id: number,
    username: string,
    patch: Partial<Homefeed>,
  ): Promise<void> {
    const me = await this.loadUser(username);
    await this.assertOrgMembership(activeOrgId, me.id);

    // Only author (future: org admins) can edit
    const existing = await this.homefeedRepository.findOne({
      where: { id, organization: { id: activeOrgId } },
      relations: ['createdBy'],
    });
    if (!existing) throw new NotFoundException('Card not found');
    if (existing.createdBy.id !== me.id)
      throw new ForbiddenException('Only author can edit this card');

    // NOTE: For changing visibility/team/layer you may add validations similar to create()
    await this.homefeedRepository.update(id, patch);
  }

  async remove(
    activeOrgId: number,
    id: number,
    username: string,
  ): Promise<void> {
    const me = await this.loadUser(username);
    await this.assertOrgMembership(activeOrgId, me.id);

    const existing = await this.homefeedRepository.findOne({
      where: { id, organization: { id: activeOrgId } },
      relations: ['createdBy'],
    });
    if (!existing) return;
    if (existing.createdBy.id !== me.id)
      throw new ForbiddenException('Only author can delete this card');

    await this.homefeedRepository.delete(id);
  }

  // ---------- Feeds (org-scoped & visibility-aware) ----------

  /** Main feed: everything in org that the user can see (ordered by createdAt desc). */
  async getHomeFeed(
    activeOrgId: number,
    username: string,
    limit = 50,
    opts?: {
      layerIds?: number[]; // optional: filter to specific layer ids
      layerKeys?: string[]; // optional: filter to specific layer keys
      onlyLayered?: boolean; // optional: only items that belong to some layer
    },
  ): Promise<Homefeed[]> {
    const me = await this.loadUser(username);
    const mem = await this.getOrgMembership(activeOrgId, me.id);

    const qb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoin('h.createdBy', 'author')
      .leftJoinAndSelect('h.layer', 'layer')
      .leftJoinAndSelect('h.team', 'team')
      .where('h.organizationId = :orgId', { orgId: activeOrgId })
      .setParameters({ userId: me.id });

    // Optional filters
    if (opts?.onlyLayered) qb.andWhere('h.layerId IS NOT NULL');
    if (opts?.layerIds?.length)
      qb.andWhere('h.layerId IN (:...layerIds)', { layerIds: opts.layerIds });
    if (opts?.layerKeys?.length)
      qb.andWhere('layer.key IN (:...layerKeys)', {
        layerKeys: opts.layerKeys,
      });

    // Visibility guard
    this.applyVisibilityClause(qb, me.id);
    if (mem.role === OrgRole.GUEST) this.restrictGuestToMyLayers(qb, me.id);

    // Prefer items from layers where I'm a member, then newest
    const lmSub = qb
      .subQuery()
      .select('1')
      .from(LayerMember, 'lm')
      .where('lm.layerId = h.layerId')
      .andWhere('lm.userId = :userId')
      .getQuery();

    qb.addOrderBy(
      `CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`,
      'ASC',
    )
      .addOrderBy('h.createdAt', 'DESC')
      .limit(limit);

    return qb.getMany();
  }

  /** A lightweight recommender that stays visibility-safe and org-scoped, with layer awareness. */
  private async fetchRandomItemsBasedOnUserPreferences(
    activeOrgId: number,
    userId: number,
    count = 10,
  ): Promise<Homefeed[]> {
    // Prior interactions (org-scoped for signal)
    const interactions = await this.userInteractionRepository.find({
      where: {
        user: { id: userId } as any,
        homefeedItem: { organization: { id: activeOrgId } } as any,
      },
      relations: ['homefeedItem'],
      take: 200,
    });

    const interactedIds = interactions
      .map((i) => i.homefeedItem?.id)
      .filter((id): id is number => !!id);

    // Base query (visibility-safe), hydrate layer & team
    const qb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoin('h.createdBy', 'author')
      .leftJoinAndSelect('h.layer', 'layer')
      .leftJoinAndSelect('h.team', 'team')
      .where('h.organizationId = :orgId', { orgId: activeOrgId })
      .setParameters({ userId });

    if (interactedIds.length) {
      qb.andWhere('h.id NOT IN (:...seen)', { seen: interactedIds });
    }

    this.applyVisibilityClause(qb, userId);

    // Bias toward items from layers where I'm a member (nice UX)
    const lmSub = qb
      .subQuery()
      .select('1')
      .from(LayerMember, 'lm')
      .where('lm.layerId = h.layerId')
      .andWhere('lm.userId = :userId')
      .getQuery();

    // Basic "popularity via similar users" gate (optional but keeps signal)
    if (interactedIds.length) {
      qb.andWhere((sqb) => {
        const sub = sqb
          .subQuery()
          .select('1')
          .from(UserInteraction, 'ui2')
          .where('ui2.homefeedItemId = h.id')
          .andWhere('ui2.userId != :me', { me: userId })
          .getQuery();
        return `EXISTS (${sub})`;
      });
    }

    qb.addOrderBy(
      `CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`,
      'ASC',
    )
      .addOrderBy('h.createdAt', 'DESC')
      .limit(count);

    const rec = await qb.getMany();
    if (rec.length >= count) return rec;

    // Top up with random org-visible items the user hasn't seen; still hydrate layer/team
    const topupQb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoin('h.createdBy', 'author')
      .leftJoinAndSelect('h.layer', 'layer')
      .leftJoinAndSelect('h.team', 'team')
      .where('h.organizationId = :orgId', { orgId: activeOrgId })
      .setParameters({ userId })
      .andWhere(interactedIds.length ? 'h.id NOT IN (:...seen)' : '1=1', {
        seen: interactedIds.length ? interactedIds : [-1],
      });

    this.applyVisibilityClause(topupQb, userId);

    topupQb
      .addOrderBy(
        `CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('RANDOM()')
      .limit(count - rec.length);

    const topup = await topupQb.getMany();
    return [...rec, ...topup];
  }

  /** Cards in a layer that the user can see (any visibility), ordered by recency. */
  async getLayerFeed(
    activeOrgId: number,
    username: string,
    layerId: number,
    limit = 50,
  ): Promise<Homefeed[]> {
    const me = await this.loadUser(username);
    const mem = await this.getOrgMembership(activeOrgId, me.id);

    const layer = await this.layerRepo.findOne({
      where: { id: layerId, organization: { id: activeOrgId } },
    });
    if (!layer) throw new NotFoundException('Layer not found');

    if (mem.role === OrgRole.GUEST) {
      const isMember = await this.layerMemberRepo.findOne({
        where: { layer: { id: layerId }, user: { id: me.id }, isActive: true },
      });
      if (!isMember)
        throw new ForbiddenException(
          'Guests can only access their member layers',
        );
    }

    const qb = this.homefeedRepository
      .createQueryBuilder('h')
      .leftJoin('h.createdBy', 'author')
      .leftJoinAndSelect('h.layer', 'layer')
      .leftJoinAndSelect('h.team', 'team')
      .where('h.organizationId = :orgId', { orgId: activeOrgId })
      .andWhere('h.layerId = :layerId', { layerId })
      .setParameters({ userId: me.id });

    this.applyVisibilityClause(qb, me.id);
    if (mem.role === OrgRole.GUEST) this.restrictGuestToMyLayers(qb, me.id);

    qb.orderBy('h.createdAt', 'DESC').limit(limit);
    return qb.getMany();
  }
}
