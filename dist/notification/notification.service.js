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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const MENTION_RE = /@(\w+)/g;
let NotificationService = class NotificationService {
    constructor(notificationRepository, userRepository, homefeedRepository, orgMemberRepo, layerMemberRepo) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.homefeedRepository = homefeedRepository;
        this.orgMemberRepo = orgMemberRepo;
        this.layerMemberRepo = layerMemberRepo;
    }
    async getUserByUsername(username) {
        const u = await this.userRepository.findOne({ where: { username } });
        if (!u)
            throw new common_1.NotFoundException('User not found');
        return u;
    }
    async assertOrgMember(orgId, userId) {
        const m = await this.orgMemberRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m)
            throw new common_1.ForbiddenException('Not an organization member');
    }
    async assertLayerMember(layerId, userId) {
        const m = await this.layerMemberRepo.findOne({
            where: { layer: { id: layerId }, user: { id: userId } },
        });
        if (!m)
            throw new common_1.ForbiddenException('Not a layer member');
    }
    async createNotification(actor, homefeedItem, type, targetUser) {
        if (!homefeedItem?.organization) {
            throw new common_1.BadRequestException('Homefeed item missing organization');
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
    async createLikeNotification(likingUser, homefeedItem) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser?.id && targetUser.id !== likingUser.id) {
            await this.createNotification(likingUser, homefeedItem, 'liked', targetUser);
        }
    }
    async createRepostNotification(repostingUser, homefeedItem) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser?.id && targetUser.id !== repostingUser.id) {
            await this.createNotification(repostingUser, homefeedItem, 'reposted', targetUser);
        }
    }
    async getOrgUserNotifications(orgId, username) {
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
    async getLayerUserNotifications(layerId, username) {
        const user = await this.getUserByUsername(username);
        await this.assertLayerMember(layerId, user.id);
        return this.notificationRepository
            .createQueryBuilder('n')
            .leftJoinAndSelect('n.homefeedItem', 'h')
            .leftJoinAndSelect('n.user', 'actor')
            .leftJoinAndSelect('n.targetUser', 'target')
            .where('n.targetUserId = :userId', { userId: user.id })
            .andWhere('h.layerId = :layerId', { layerId })
            .andWhere('h.visibility = :vis', { vis: homefeed_entity_1.Visibility.LAYER })
            .orderBy('n.createdAt', 'DESC')
            .limit(100)
            .getMany();
    }
    async createMentionNotifications(actor, item) {
        const fresh = await this.homefeedRepository.findOne({
            where: { id: item.id },
            relations: ['organization', 'createdBy'],
        });
        if (!fresh?.organization?.id)
            return;
        const orgId = fresh.organization.id;
        const source = [fresh.title, fresh.description, fresh.text].filter(Boolean).join(' ') ??
            '';
        const tokens = Array.from(source.matchAll(MENTION_RE)).map((m) => m[1]);
        if (!tokens.length)
            return;
        const usernameTokens = Array.from(new Set(tokens.filter((t) => !/^\d+$/.test(t).valueOf())));
        const cardIdTokens = Array.from(new Set(tokens
            .filter((t) => /^\d+$/.test(t))
            .map((s) => Number.parseInt(s, 10))
            .filter((n) => Number.isFinite(n))));
        let usersByName = [];
        if (usernameTokens.length) {
            usersByName = await this.userRepository.find({
                where: { username: (0, typeorm_2.In)(usernameTokens) },
            });
        }
        let usersByCard = [];
        if (cardIdTokens.length) {
            const cards = await this.homefeedRepository.find({
                where: { id: (0, typeorm_2.In)(cardIdTokens), organization: { id: orgId } },
                relations: ['createdBy', 'organization'],
            });
            usersByCard = cards
                .map((c) => c.createdBy)
                .filter((u) => !!u?.id);
        }
        const candidateIds = Array.from(new Set([...usersByName, ...usersByCard]
            .map((u) => u.id)
            .filter((id) => id && id !== actor.id)));
        if (!candidateIds.length)
            return;
        const activeMembers = await this.orgMemberRepo.find({
            where: {
                organization: { id: orgId },
                user: { id: (0, typeorm_2.In)(candidateIds) },
                isActive: true,
            },
            relations: ['user'],
        });
        const allowedTargets = activeMembers
            .map((m) => m.user)
            .filter((u) => !!u?.id);
        await Promise.all(allowedTargets.map((u) => this.createNotification(actor, fresh, 'mentioned', u)));
    }
    async getUnreadCount(orgId, username) {
        const viewer = await this.getUserByUsername(username);
        await this.assertOrgMember(orgId, viewer.id);
        return this.notificationRepository
            .createQueryBuilder('n')
            .where('n.organizationId = :orgId', { orgId })
            .andWhere('n.targetUserId = :uid', { uid: viewer.id })
            .andWhere('n.readAt IS NULL')
            .getCount();
    }
    async markAllRead(orgId, username) {
        const viewer = await this.getUserByUsername(username);
        await this.assertOrgMember(orgId, viewer.id);
        const { affected } = await this.notificationRepository
            .createQueryBuilder()
            .update()
            .set({ readAt: () => 'CURRENT_TIMESTAMP' })
            .where('organizationId = :orgId', { orgId })
            .andWhere('targetUserId = :uid', { uid: viewer.id })
            .andWhere('readAt IS NULL')
            .execute();
        return affected ?? 0;
    }
    async markOneRead(orgId, username, id) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __param(3, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(4, (0, typeorm_1.InjectRepository)(layer_member_entity_1.LayerMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map