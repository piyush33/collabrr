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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const conversation_entity_1 = require("./conversation.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
let MessageService = class MessageService {
    constructor(messageRepo, userRepo, convoRepo, orgMemRepo, layerMemRepo) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.convoRepo = convoRepo;
        this.orgMemRepo = orgMemRepo;
        this.layerMemRepo = layerMemRepo;
    }
    async getUser(username) {
        const u = await this.userRepo.findOne({ where: { username } });
        if (!u)
            throw new common_1.NotFoundException('User not found');
        return u;
    }
    async assertOrgMember(orgId, userId) {
        const m = await this.orgMemRepo.findOne({
            where: {
                organization: { id: orgId },
                user: { id: userId },
                isActive: true,
            },
        });
        if (!m)
            throw new common_1.ForbiddenException('Not an org member');
    }
    async assertLayerMember(layerId, userId) {
        const m = await this.layerMemRepo.findOne({
            where: { layer: { id: layerId }, user: { id: userId } },
        });
        if (!m)
            throw new common_1.ForbiddenException('Not a layer member');
    }
    usersOrdered(a, b) {
        return a < b ? [a, b] : [b, a];
    }
    async sendOrgMessage(orgId, senderUsername, recipientUsername, content) {
        if (!content?.trim())
            throw new common_1.BadRequestException('Empty message');
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
            .andWhere('((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))', { a, b })
            .getOne();
        if (!convo) {
            convo = this.convoRepo.create({
                organization: { id: orgId },
                user1: { id: a },
                user2: { id: b },
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
    async getOrgConversationHistory(orgId, user1Username, user2Username) {
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
            .andWhere('((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))', { a, b })
            .getOne();
        if (!convo)
            throw new common_1.NotFoundException('Conversation not found');
        return (convo.messages || []).sort((x, y) => +new Date(x.createdAt) - +new Date(y.createdAt));
    }
    async getOrgRecentConversations(orgId, username) {
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
    async sendLayerMessage(layerId, senderUsername, recipientUsername, content) {
        if (!content?.trim())
            throw new common_1.BadRequestException('Empty message');
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
            .andWhere('((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))', { a, b })
            .getOne();
        if (!convo) {
            convo = this.convoRepo.create({
                layer: { id: layerId },
                user1: { id: a },
                user2: { id: b },
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
    async getLayerConversationHistory(layerId, user1Username, user2Username) {
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
            .andWhere('((c.user1Id = :a AND c.user2Id = :b) OR (c.user1Id = :b AND c.user2Id = :a))', { a, b })
            .getOne();
        if (!convo)
            throw new common_1.NotFoundException('Conversation not found');
        return (convo.messages || []).sort((x, y) => +new Date(x.createdAt) - +new Date(y.createdAt));
    }
    async getLayerRecentConversations(layerId, username) {
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
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(3, (0, typeorm_1.InjectRepository)(organization_member_entity_1.OrganizationMember)),
    __param(4, (0, typeorm_1.InjectRepository)(layer_member_entity_1.LayerMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessageService);
//# sourceMappingURL=message.service.js.map