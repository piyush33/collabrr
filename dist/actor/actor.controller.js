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
exports.ActorController = void 0;
const common_1 = require("@nestjs/common");
const actor_service_1 = require("./actor.service");
let ActorController = class ActorController {
    constructor(actorService) {
        this.actorService = actorService;
    }
    async getActor(username) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return {
            '@context': [
                "https://www.w3.org/ns/activitystreams",
                {
                    "PublicKey": "https://w3id.org/security#PublicKey"
                }
            ],
            id: `https://social.opinionth.com/actors/${actor.preferredUsername}`,
            type: 'Person',
            preferredUsername: actor.preferredUsername,
            name: actor.name,
            inbox: `https://social.opinionth.com/actors/${actor.preferredUsername}/inbox`,
            outbox: `https://social.opinionth.com/actors/${actor.preferredUsername}/outbox`,
            liked: `https://social.opinionth.com/actors/liked`,
            followers: `https://social.opinionth.com/actors/${actor.preferredUsername}/followers`,
            following: `https://social.opinionth.com/actors/${actor.preferredUsername}/following`,
            publicKey: {
                id: `https://social.opinionth.com/actors/${actor.preferredUsername}#main-key`,
                owner: `https://social.opinionth.com/actors/${actor.preferredUsername}`,
                publicKeyPem: actor.publicKey
            },
            summary: actor.summary || 'This is a random summary',
            icon: [
                "https://opinionthbucket.s3.eu-north-1.amazonaws.com/profile-images/a941beff-7577-42e7-98d3-5f6289d51590-12371158_1164591293570960_1294003296995843062_o.jpg"
            ]
        };
    }
    async createActor(actorData) {
        return this.actorService.createActor(actorData);
    }
    async updateActor(id, updateData) {
        return this.actorService.updateActor(id, updateData);
    }
    async getFollowers(username) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        const followers = await this.actorService.getFollowers(actor.id);
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/followers`,
            type: 'OrderedCollection',
            totalItems: followers.length,
            orderedItems: followers.map(follower => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${follower.preferredUsername}`,
                type: 'Person',
            })),
        };
    }
    async getFollowing(username) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        const following = await this.actorService.getFollowing(actor.id);
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/following`,
            type: 'OrderedCollection',
            totalItems: following.length,
            orderedItems: following.map(followingUser => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${followingUser.preferredUsername}`,
                type: 'Person',
            })),
        };
    }
    async followActor(actorId, { targetActorId }) {
        const actor = await this.actorService.findById(actorId);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return this.actorService.follow(actorId, targetActorId);
    }
    async acceptFollowRequest(actorId, { followerId }) {
        return this.actorService.acceptFollowRequest(actorId, followerId);
    }
    async getLiked(username) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'OrderedCollection',
            totalItems: 0,
            orderedItems: [],
        };
    }
};
exports.ActorController = ActorController;
__decorate([
    (0, common_1.Get)(':username'),
    (0, common_1.Header)('Content-Type', 'application/ld+json ; profile="https://www.w3.org/ns/activitystreams"'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "getActor", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "createActor", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "updateActor", null);
__decorate([
    (0, common_1.Get)(':username/followers'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)(':username/following'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Post)(':actorId/follow'),
    __param(0, (0, common_1.Param)('actorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "followActor", null);
__decorate([
    (0, common_1.Post)(':actorId/acceptFollow'),
    __param(0, (0, common_1.Param)('actorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "acceptFollowRequest", null);
__decorate([
    (0, common_1.Get)('liked'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActorController.prototype, "getLiked", null);
exports.ActorController = ActorController = __decorate([
    (0, common_1.Controller)('actors'),
    __metadata("design:paramtypes", [actor_service_1.ActorService])
], ActorController);
//# sourceMappingURL=actor.controller.js.map