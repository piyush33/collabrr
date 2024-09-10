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
exports.ActorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const actor_entity_1 = require("./actor.entity");
let ActorService = class ActorService {
    constructor(actorRepository) {
        this.actorRepository = actorRepository;
    }
    async findByUsername(username) {
        return this.actorRepository.findOne({ where: { preferredUsername: username } });
    }
    async findById(id) {
        return await this.actorRepository.findOne({ where: { id }, relations: ['followers', 'following'] });
    }
    async createActor(data) {
        const actor = this.actorRepository.create(data);
        return this.actorRepository.save(actor);
    }
    async updateActor(id, updateData) {
        const actor = await this.findById(id);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        Object.assign(actor, updateData);
        return this.actorRepository.save(actor);
    }
    async getFollowers(actorId) {
        const actor = await this.actorRepository.findOne({
            where: { id: actorId },
            relations: ['followers'],
        });
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return actor.followers;
    }
    async getFollowing(actorId) {
        const actor = await this.actorRepository.findOne({
            where: { id: actorId },
            relations: ['following'],
        });
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return actor.following;
    }
    async follow(actorId, targetActorId) {
        const actor = await this.findById(actorId);
        const targetActor = await this.findById(targetActorId);
        if (!actor || !targetActor) {
            throw new common_1.NotFoundException('Actor or target actor not found');
        }
        actor.following.push(targetActor);
        await this.actorRepository.save(actor);
        const followActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Follow',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${targetActor.preferredUsername}`,
        };
        const targetActorInbox = `${targetActor.inbox}/inbox`;
        const response = await fetch(targetActorInbox, {
            method: 'POST',
            body: JSON.stringify(followActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });
        if (!response.ok) {
            throw new Error(`Failed to send follow activity: ${response.statusText}`);
        }
        return { status: 'Follow request sent', target: targetActor.preferredUsername };
    }
    async acceptFollowRequest(actorId, followerId) {
        const actor = await this.findById(actorId);
        const follower = await this.findById(followerId);
        if (!actor || !follower) {
            throw new common_1.NotFoundException('Actor or follower not found');
        }
        const acceptActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Accept',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: {
                type: 'Follow',
                actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${follower.preferredUsername}`,
                object: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            },
        };
        const followerInbox = `${follower.inbox}/inbox`;
        const response = await fetch(followerInbox, {
            method: 'POST',
            body: JSON.stringify(acceptActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });
        if (!response.ok) {
            throw new Error(`Failed to send accept activity: ${response.statusText}`);
        }
        actor.followers.push(follower);
        await this.actorRepository.save(actor);
        return { status: 'Follow request accepted', follower: follower.preferredUsername };
    }
};
exports.ActorService = ActorService;
exports.ActorService = ActorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(actor_entity_1.Actor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActorService);
//# sourceMappingURL=actor.service.js.map