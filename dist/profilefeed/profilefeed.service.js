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
exports.ProfileFeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profilefeed_item_entity_1 = require("./profilefeed-item.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const organization_member_entity_2 = require("../organization/organization-member.entity");
const FEED_RELATION_MAP = {
    created: 'userCreated',
    liked: 'userLiked',
    reposted: 'userReposted',
    saved: 'userSaved',
};
let ProfileFeedService = class ProfileFeedService {
    constructor(profileFeedRepository, userRepository, orgRepository, orgMemberRepo, layerRepo, layerMemberRepo) {
        this.profileFeedRepository = profileFeedRepository;
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
        this.orgMemberRepo = orgMemberRepo;
        this.layerRepo = layerRepo;
        this.layerMemberRepo = layerMemberRepo;
    }
    assertValidFeedType(feedType) {
        if (!['created', 'liked', 'reposted', 'saved'].includes(feedType)) {
            throw new common_1.BadRequestException('Invalid feedType. Use one of: created|liked|reposted|saved');
        }
    }
    async getUser(username) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user)
            throw new common_1.NotFoundException('ProfileUser not found');
        return user;
    }
    async assertOrgExists(orgId) {
        const org = await this.orgRepository.findOne({ where: { id: orgId } });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async assertSubjectIsOrgMember(orgId, userId) {
        const m = await this.orgMemberRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m)
            throw new common_1.ForbiddenException('User is not a member of this organization');
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
            throw new common_1.ForbiddenException('User is not a member of this organization');
        return m;
    }
    async filterByLayerLock(orgId, viewerId, items, opts) {
        const keys = Array.from(new Set(items.map((i) => i.layerKey).filter((k) => k != null)));
        if (!keys.length)
            return opts?.viewerIsGuest ? [] : items;
        const layers = await this.layerRepo.find({
            where: { organization: { id: orgId }, key: (0, typeorm_2.In)(keys) },
        });
        if (!layers.length)
            return opts?.viewerIsGuest ? [] : items;
        const layerByKey = new Map(layers.map((l) => [l.key, l]));
        const lockedIds = layers.filter((l) => !!l.isLocked).map((l) => l.id);
        const memberships = await this.layerMemberRepo.find({
            where: {
                layer: { id: (0, typeorm_2.In)(layers.map((l) => l.id)) },
                user: { id: viewerId },
                isActive: true,
            },
            relations: ['layer'],
        });
        const allowedLayerIds = new Set(memberships.map((m) => m.layer.id));
        if (opts?.viewerIsGuest) {
            return items.filter((i) => {
                const layer = i.layerKey != null ? layerByKey.get(i.layerKey) : undefined;
                if (!layer)
                    return false;
                return allowedLayerIds.has(layer.id);
            });
        }
        return items.filter((i) => {
            const layer = i.layerKey != null ? layerByKey.get(i.layerKey) : undefined;
            if (!layer)
                return true;
            if (!layer.isLocked)
                return true;
            if (opts?.authorUsername && i.username === opts.authorUsername)
                return true;
            return allowedLayerIds.has(layer.id);
        });
    }
    async findAll(orgId) {
        await this.assertOrgExists(orgId);
        return this.profileFeedRepository.find({
            where: { organization: { id: orgId } },
            order: { id: 'DESC' },
        });
    }
    async findOne(orgId, id) {
        await this.assertOrgExists(orgId);
        const item = await this.profileFeedRepository.findOne({
            where: { id, organization: { id: orgId } },
        });
        if (!item)
            throw new common_1.NotFoundException('ProfileFeed item not found');
        return item;
    }
    async findAllByFeedType(orgId, subjectUsername, feedType, viewerUsername) {
        this.assertValidFeedType(feedType);
        const subject = await this.getUser(subjectUsername);
        const viewer = await this.getUser(viewerUsername);
        await this.assertOrgExists(orgId);
        await this.assertSubjectIsOrgMember(orgId, viewer.id);
        await this.assertSubjectIsOrgMember(orgId, subject.id);
        const viewerMem = await this.getOrgMembership(orgId, viewer.id);
        const relationKey = FEED_RELATION_MAP[feedType];
        const where = {
            organization: { id: orgId },
            [relationKey]: { id: subject.id },
        };
        const items = await this.profileFeedRepository.find({
            where,
            order: { id: 'DESC' },
        });
        const filtered = await this.filterByLayerLock(orgId, viewer.id, items, viewerMem.role === organization_member_entity_2.OrgRole.GUEST
            ? { viewerIsGuest: true }
            : { authorUsername: viewerUsername });
        return filtered.map((i) => this.toDto(i));
    }
    async create(orgId, username, dto, feedType) {
        this.assertValidFeedType(feedType);
        const user = await this.getUser(username);
        const org = await this.assertOrgExists(orgId);
        await this.assertSubjectIsOrgMember(orgId, user.id);
        const relationKey = FEED_RELATION_MAP[feedType];
        const feedItem = this.profileFeedRepository.create({
            ...dto,
            username: dto.username ?? username,
            organization: org,
        });
        feedItem[relationKey] = user;
        const saved = await this.profileFeedRepository.save(feedItem);
        return this.toDto(saved);
    }
    async update(orgId, id, patch) {
        await this.assertOrgExists(orgId);
        const existing = await this.profileFeedRepository.findOne({
            where: { id, organization: { id: orgId } },
        });
        if (!existing)
            throw new common_1.NotFoundException('ProfileFeed item not found');
        Object.assign(existing, patch);
        const saved = await this.profileFeedRepository.save(existing);
        return this.toDto(saved);
    }
    async delete(orgId, username, id, feedType) {
        this.assertValidFeedType(feedType);
        const user = await this.getUser(username);
        await this.assertOrgExists(orgId);
        await this.assertSubjectIsOrgMember(orgId, user.id);
        const relationKey = FEED_RELATION_MAP[feedType];
        const item = await this.profileFeedRepository.findOne({
            where: {
                id,
                organization: { id: orgId },
                [relationKey]: { id: user.id },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Feed item not found');
        await this.profileFeedRepository.delete(item.id);
    }
    toDto(feedItem) {
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
};
exports.ProfileFeedService = ProfileFeedService;
exports.ProfileFeedService = ProfileFeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profilefeed_item_entity_1.ProfileFeedItem)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(3, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(4, (0, typeorm_1.InjectRepository)(linked_card_layer_entity_1.LinkedCardLayer)),
    __param(5, (0, typeorm_1.InjectRepository)(layer_member_entity_1.LayerMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProfileFeedService);
//# sourceMappingURL=profilefeed.service.js.map