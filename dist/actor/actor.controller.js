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
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            type: 'Person',
            preferredUsername: actor.preferredUsername,
            name: actor.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/following`,
            publicKey: {
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}#main-key`,
                owner: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                publicKeyPem: actor.publicKey
            },
            summary: actor.summary || '',
        };
    }
    async createActor(actorData) {
        return this.actorService.createActor(actorData);
    }
    async updateActor(id, updateData) {
        return this.actorService.updateActor(id, updateData);
    }
    async followActor(actorId, { targetActor }) {
        const actor = await this.actorService.findById(actorId);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return this.actorService.follow(actorId, targetActor);
    }
    async acceptFollowRequest(actorId, { follower }) {
        return this.actorService.acceptFollowRequest(actorId, follower);
    }
};
exports.ActorController = ActorController;
__decorate([
    (0, common_1.Get)(':username'),
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
exports.ActorController = ActorController = __decorate([
    (0, common_1.Controller)('actors'),
    __metadata("design:paramtypes", [actor_service_1.ActorService])
], ActorController);
//# sourceMappingURL=actor.controller.js.map