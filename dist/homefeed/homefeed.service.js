"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomefeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const homefeed_entity_1 = require("./homefeed.entity");
const user_interaction_entity_1 = require("./user-interaction.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const team_member_entity_1 = require("../organization/team-member.entity");
const team_card_access_entity_1 = require("../organization/team-card-access.entity");
const team_entity_1 = require("../organization/team.entity");
const linked_card_layer_entity_1 = require("./linked-card-layer.entity");
const layer_member_entity_1 = require("./layer-member.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const notification_service_1 = require("../notification/notification.service");
let HomefeedService = class HomefeedService {
    constructor(homefeedRepository, userInteractionRepository, profileUserRepository, orgMemberRepo, teamMemberRepo, teamCardAccessRepo, teamRepo, layerRepo, layerMemberRepo, orgRepo, notifications) {
        this.homefeedRepository = homefeedRepository;
        this.userInteractionRepository = userInteractionRepository;
        this.profileUserRepository = profileUserRepository;
        this.orgMemberRepo = orgMemberRepo;
        this.teamMemberRepo = teamMemberRepo;
        this.teamCardAccessRepo = teamCardAccessRepo;
        this.teamRepo = teamRepo;
        this.layerRepo = layerRepo;
        this.layerMemberRepo = layerMemberRepo;
        this.orgRepo = orgRepo;
        this.notifications = notifications;
    }
    async getOrgMembership(orgId, userId) {
        const m = await this.orgMemberRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m)
            throw new common_1.ForbiddenException(`Not an active member of this organization ${orgId}, ${userId}`);
        return m;
    }
    restrictGuestToMyLayers(qb, userId) {
        const lmExists = qb
            .subQuery()
            .select('1')
            .from(layer_member_entity_1.LayerMember, 'lm')
            .where('lm.layerId = h.layerId')
            .andWhere('lm.userId = :userId')
            .andWhere('lm.isActive = true')
            .getQuery();
        qb.andWhere('h.layerId IS NOT NULL')
            .andWhere(`EXISTS (${lmExists})`)
            .setParameters({ ...qb.getParameters(), userId });
        return qb;
    }
    async loadUser(username) {
        const user = await this.profileUserRepository.findOne({
            where: { username },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async assertOrgMembership(orgId, userId) {
        console.log('data:', userId, orgId);
        const m = await this.orgMemberRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m) {
            throw new common_1.ForbiddenException(`Not an active member of this organization ${orgId}, ${userId}`);
        }
    }
    async resolveOrUpsertLayer(orgId, authorId, layerId, layerKey, autoAddAuthorMember = true) {
        if (!layerId && !layerKey) {
            throw new common_1.BadRequestException('Provide layerId or layerKey');
        }
        if (layerId) {
            const found = await this.layerRepo.findOne({
                where: { id: layerId, organization: { id: orgId } },
            });
            if (!found)
                throw new common_1.BadRequestException('Layer not found in this org');
            return found;
        }
        const key = layerKey;
        let layer = await this.layerRepo.findOne({
            where: { key, organization: { id: orgId } },
        });
        if (layer)
            return layer;
        try {
            layer = await this.layerRepo.save(this.layerRepo.create({
                key,
                organization: { id: orgId },
                createdBy: { id: authorId },
            }));
            if (autoAddAuthorMember) {
                await this.layerMemberRepo.save({
                    layer: { id: layer.id },
                    user: { id: authorId },
                    isActive: true,
                });
            }
            return layer;
        }
        catch (e) {
            if (e?.code === '23505') {
                const reread = await this.layerRepo.findOne({
                    where: { key, organization: { id: orgId } },
                });
                if (!reread)
                    throw new common_1.ConflictException('Layer upsert failed');
                return reread;
            }
            throw e;
        }
    }
    applyVisibilityClause(qb, userId) {
        qb.setParameters({ ...qb.getParameters(), userId });
        const teamMemberSub = qb
            .subQuery()
            .select('1')
            .from(team_member_entity_1.TeamMember, 'tm')
            .where('tm.teamId = h.teamId')
            .andWhere('tm.userId = :userId')
            .andWhere('tm.isActive = true')
            .getQuery();
        const teamAclExists = qb
            .subQuery()
            .select('1')
            .from(team_card_access_entity_1.TeamCardAccess, 'tca')
            .where('tca.homefeedId = h.id')
            .getQuery();
        const teamAclHasMe = qb
            .subQuery()
            .select('1')
            .from(team_card_access_entity_1.TeamCardAccess, 'tca2')
            .where('tca2.homefeedId = h.id')
            .andWhere('tca2.userId = :userId')
            .getQuery();
        const layerMemberSub = qb
            .subQuery()
            .select('1')
            .from(layer_member_entity_1.LayerMember, 'lm')
            .where('lm.layerId = h.layerId')
            .andWhere('lm.userId = :userId')
            .andWhere('lm.isActive = true')
            .getQuery();
        const layerLockedSub = qb
            .subQuery()
            .select('1')
            .from(linked_card_layer_entity_1.LinkedCardLayer, 'ly1')
            .where('ly1.id = h.layerId')
            .andWhere('ly1.isLocked = true')
            .getQuery();
        const layerUnlockedSub = qb
            .subQuery()
            .select('1')
            .from(linked_card_layer_entity_1.LinkedCardLayer, 'ly2')
            .where('ly2.id = h.layerId')
            .andWhere('(ly2.isLocked IS DISTINCT FROM true)')
            .getQuery();
        qb.andWhere(new typeorm_2.Brackets((b) => {
            b.where('h.visibility = :orgVis', { orgVis: homefeed_entity_1.Visibility.ORG })
                .orWhere(new typeorm_2.Brackets((p) => {
                p.where('h.visibility = :privateVis', {
                    privateVis: homefeed_entity_1.Visibility.PRIVATE,
                }).andWhere('author.id = :userId');
            }))
                .orWhere(new typeorm_2.Brackets((t) => {
                t.where('h.visibility = :teamVis', { teamVis: homefeed_entity_1.Visibility.TEAM })
                    .andWhere(`EXISTS (${teamMemberSub})`)
                    .andWhere(new typeorm_2.Brackets((acl) => {
                    acl
                        .where(`NOT EXISTS (${teamAclExists})`)
                        .orWhere(`EXISTS (${teamAclHasMe})`);
                }));
            }))
                .orWhere(new typeorm_2.Brackets((l) => {
                l.where('h.visibility = :layerVis', {
                    layerVis: homefeed_entity_1.Visibility.LAYER,
                }).andWhere(new typeorm_2.Brackets((v) => {
                    v.where(`EXISTS (${layerLockedSub}) AND EXISTS (${layerMemberSub})`).orWhere(`EXISTS (${layerUnlockedSub}) AND (EXISTS (${layerMemberSub}) OR author.id = :userId)`);
                }));
            }));
        }));
        return qb;
    }
    async lockLayerAndEnsureMembers(orgId, layerId, memberIds, authorId) {
        const uniqueIds = Array.from(new Set([authorId, ...memberIds]));
        const rows = await this.orgMemberRepo.find({
            where: {
                organization: { id: orgId },
                user: { id: (0, typeorm_2.In)(uniqueIds) },
                isActive: true,
            },
            relations: ['user'],
        });
        if (rows.length !== uniqueIds.length) {
            throw new common_1.BadRequestException('All allowed members must be active members of the organization');
        }
        await this.layerRepo.update({ id: layerId }, { isLocked: true });
        const existing = await this.layerMemberRepo.find({
            where: { layer: { id: layerId }, user: { id: (0, typeorm_2.In)(uniqueIds) } },
            relations: ['user'],
        });
        const existingSet = new Set(existing.map((e) => e.user.id));
        const toCreate = uniqueIds
            .filter((id) => !existingSet.has(id))
            .map((id) => this.layerMemberRepo.create({
            layer: { id: layerId },
            user: { id },
            isActive: true,
        }));
        if (toCreate.length)
            await this.layerMemberRepo.save(toCreate);
    }
    async findAll(activeOrgId, username) {
        const me = await this.loadUser(username);
        const mem = await this.getOrgMembership(activeOrgId, me.id);
        const qb = this.homefeedRepository
            .createQueryBuilder('h')
            .leftJoin('h.createdBy', 'author')
            .where('h.organizationId = :orgId', { orgId: activeOrgId })
            .setParameters({ userId: me.id });
        this.applyVisibilityClause(qb, me.id);
        if (mem.role === organization_member_entity_1.OrgRole.GUEST)
            this.restrictGuestToMyLayers(qb, me.id);
        qb.orderBy('h.createdAt', 'DESC');
        return qb.getMany();
    }
    async findOne(activeOrgId, id, username) {
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
        if (mem.role === organization_member_entity_1.OrgRole.GUEST)
            this.restrictGuestToMyLayers(qb, me.id);
        const row = await qb.getOne();
        if (!row)
            throw new common_1.NotFoundException('Card not found or not accessible');
        return row;
    }
    async create(orgId, username, dto, opts) {
        const me = await this.loadUser(username);
        await this.assertOrgMembership(orgId, me.id);
        const wantsLayer = !!dto.layerId || !!dto.layerKey;
        let layer = undefined;
        if (wantsLayer) {
            layer = await this.resolveOrUpsertLayer(orgId, me.id, dto.layerId, dto.layerKey, true);
        }
        if (dto.visibility === homefeed_entity_1.Visibility.LAYER && !layer) {
            throw new common_1.BadRequestException('Provide layerId or layerKey for LAYER visibility');
        }
        let team;
        if (dto.visibility === homefeed_entity_1.Visibility.TEAM) {
            if (!dto.teamId)
                throw new common_1.BadRequestException('teamId required for TEAM visibility');
            team = await this.teamRepo.findOne({
                where: { id: dto.teamId, organization: { id: orgId } },
            });
            if (!team)
                throw new common_1.BadRequestException('Team not found in this org');
            const member = await this.teamMemberRepo.findOne({
                where: { team: { id: team.id }, user: { id: me.id }, isActive: true },
            });
            if (!member)
                throw new common_1.ForbiddenException('You are not a member of this team');
        }
        if (layer && (layer.isLocked || dto.lock)) {
            const lm = await this.layerMemberRepo.findOne({
                where: { layer: { id: layer.id }, user: { id: me.id }, isActive: true },
            });
            if (!lm) {
                throw new common_1.ForbiddenException('Only layer members can post to this locked layer');
            }
        }
        const entity = this.homefeedRepository.create({
            title: dto.title,
            description: dto.description,
            image: dto.image,
            picture: dto.picture,
            text: dto.text,
            weblink: dto.weblink,
            category: dto.category,
            username: username,
            visibility: dto.visibility ?? homefeed_entity_1.Visibility.ORG,
            organization: { id: orgId },
            createdBy: { id: me.id },
            layer,
            team,
        });
        const saved = await this.homefeedRepository.save(entity);
        const allowedIds = dto.allowedMemberIds ?? opts?.allowedMemberIds ?? [];
        if (layer && dto.lock) {
            if (!allowedIds.length) {
                await this.lockLayerAndEnsureMembers(orgId, layer.id, [me.id], me.id);
            }
            else {
                await this.lockLayerAndEnsureMembers(orgId, layer.id, allowedIds, me.id);
            }
        }
        const allowIds = dto.allowedMemberIds ?? opts?.allowedMemberIds;
        if (dto.visibility === homefeed_entity_1.Visibility.TEAM && allowIds?.length) {
            const rows = await this.teamMemberRepo.find({
                where: {
                    team: { id: saved.team.id },
                    user: { id: (0, typeorm_2.In)(allowIds) },
                    isActive: true,
                },
                relations: ['user'],
            });
            if (rows.length !== allowIds.length) {
                throw new common_1.BadRequestException('Some users are not active members of this team');
            }
            await this.teamCardAccessRepo.save(allowIds.map((uid) => this.teamCardAccessRepo.create({
                homefeed: saved,
                user: { id: uid },
            })));
        }
        try {
            await this.notifications.createMentionNotifications(me, saved);
        }
        catch (e) {
            console.error('[mention notifications] failed:', e);
        }
        return saved;
    }
    async update(activeOrgId, id, username, patch) {
        const me = await this.loadUser(username);
        await this.assertOrgMembership(activeOrgId, me.id);
        const existing = await this.homefeedRepository.findOne({
            where: { id, organization: { id: activeOrgId } },
            relations: ['createdBy'],
        });
        if (!existing)
            throw new common_1.NotFoundException('Card not found');
        if (existing.createdBy.id !== me.id)
            throw new common_1.ForbiddenException('Only author can edit this card');
        await this.homefeedRepository.update(id, patch);
    }
    async remove(activeOrgId, id, username) {
        const me = await this.loadUser(username);
        await this.assertOrgMembership(activeOrgId, me.id);
        const existing = await this.homefeedRepository.findOne({
            where: { id, organization: { id: activeOrgId } },
            relations: ['createdBy'],
        });
        if (!existing)
            return;
        if (existing.createdBy.id !== me.id)
            throw new common_1.ForbiddenException('Only author can delete this card');
        await this.homefeedRepository.delete(id);
    }
    async getHomeFeed(activeOrgId, username, limit = 50, opts) {
        const me = await this.loadUser(username);
        const mem = await this.getOrgMembership(activeOrgId, me.id);
        const qb = this.homefeedRepository
            .createQueryBuilder('h')
            .leftJoin('h.createdBy', 'author')
            .leftJoinAndSelect('h.layer', 'layer')
            .leftJoinAndSelect('h.team', 'team')
            .where('h.organizationId = :orgId', { orgId: activeOrgId })
            .setParameters({ userId: me.id });
        if (opts?.onlyLayered)
            qb.andWhere('h.layerId IS NOT NULL');
        if (opts?.layerIds?.length)
            qb.andWhere('h.layerId IN (:...layerIds)', { layerIds: opts.layerIds });
        if (opts?.layerKeys?.length)
            qb.andWhere('layer.key IN (:...layerKeys)', {
                layerKeys: opts.layerKeys,
            });
        this.applyVisibilityClause(qb, me.id);
        if (mem.role === organization_member_entity_1.OrgRole.GUEST)
            this.restrictGuestToMyLayers(qb, me.id);
        const lmSub = qb
            .subQuery()
            .select('1')
            .from(layer_member_entity_1.LayerMember, 'lm')
            .where('lm.layerId = h.layerId')
            .andWhere('lm.userId = :userId')
            .getQuery();
        qb.addOrderBy(`CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('h.createdAt', 'DESC')
            .limit(limit);
        return qb.getMany();
    }
    async fetchRandomItemsBasedOnUserPreferences(activeOrgId, userId, count = 10) {
        const interactions = await this.userInteractionRepository.find({
            where: {
                user: { id: userId },
                homefeedItem: { organization: { id: activeOrgId } },
            },
            relations: ['homefeedItem'],
            take: 200,
        });
        const interactedIds = interactions
            .map((i) => i.homefeedItem?.id)
            .filter((id) => !!id);
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
        const lmSub = qb
            .subQuery()
            .select('1')
            .from(layer_member_entity_1.LayerMember, 'lm')
            .where('lm.layerId = h.layerId')
            .andWhere('lm.userId = :userId')
            .getQuery();
        if (interactedIds.length) {
            qb.andWhere((sqb) => {
                const sub = sqb
                    .subQuery()
                    .select('1')
                    .from(user_interaction_entity_1.UserInteraction, 'ui2')
                    .where('ui2.homefeedItemId = h.id')
                    .andWhere('ui2.userId != :me', { me: userId })
                    .getQuery();
                return `EXISTS (${sub})`;
            });
        }
        qb.addOrderBy(`CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('h.createdAt', 'DESC')
            .limit(count);
        const rec = await qb.getMany();
        if (rec.length >= count)
            return rec;
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
            .addOrderBy(`CASE WHEN h.layerId IS NOT NULL AND EXISTS (${lmSub}) THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('RANDOM()')
            .limit(count - rec.length);
        const topup = await topupQb.getMany();
        return [...rec, ...topup];
    }
    async getLayerFeed(activeOrgId, username, layerId, limit = 50) {
        const me = await this.loadUser(username);
        const mem = await this.getOrgMembership(activeOrgId, me.id);
        const layer = await this.layerRepo.findOne({
            where: { id: layerId, organization: { id: activeOrgId } },
        });
        if (!layer)
            throw new common_1.NotFoundException('Layer not found');
        if (mem.role === organization_member_entity_1.OrgRole.GUEST) {
            const isMember = await this.layerMemberRepo.findOne({
                where: { layer: { id: layerId }, user: { id: me.id }, isActive: true },
            });
            if (!isMember)
                throw new common_1.ForbiddenException('Guests can only access their member layers');
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
        if (mem.role === organization_member_entity_1.OrgRole.GUEST)
            this.restrictGuestToMyLayers(qb, me.id);
        qb.orderBy('h.createdAt', 'DESC').limit(limit);
        return qb.getMany();
    }
};
exports.HomefeedService = HomefeedService;
exports.HomefeedService = HomefeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __param(1, (0, typeorm_1.InjectRepository)(user_interaction_entity_1.UserInteraction)),
    __param(2, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(3, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(4, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __param(5, (0, typeorm_1.InjectRepository)(team_card_access_entity_1.TeamCardAccess)),
    __param(6, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __param(7, (0, typeorm_1.InjectRepository)(linked_card_layer_entity_1.LinkedCardLayer)),
    __param(8, (0, typeorm_1.InjectRepository)(layer_member_entity_1.LayerMember)),
    __param(9, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], HomefeedService);
//# sourceMappingURL=homefeed.service.js.map