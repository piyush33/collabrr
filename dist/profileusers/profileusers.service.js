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
exports.ProfileusersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profileuser_entity_1 = require("./profileuser.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const follower_entity_1 = require("./follower.entity");
const actor_service_1 = require("../actor/actor.service");
const crypto_1 = require("crypto");
let ProfileusersService = class ProfileusersService {
    constructor(usersRepository, profileFeedRepository, followersRepository, followingRepository, actorService) {
        this.usersRepository = usersRepository;
        this.profileFeedRepository = profileFeedRepository;
        this.followersRepository = followersRepository;
        this.followingRepository = followingRepository;
        this.actorService = actorService;
    }
    findOne(username) {
        return this.usersRepository.findOne({ where: { username }, relations: ['created', 'reposted', 'liked', 'saved'] });
    }
    async update(username, updateUserDto) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updateUserDto);
        const savedUser = await this.usersRepository.save(user);
        const actorData = {
            preferredUsername: savedUser?.username,
            name: savedUser?.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/following`,
            summary: savedUser?.tagline,
        };
        const existingActor = await this.actorService.findByUsername(username);
        if (existingActor) {
            await this.actorService.updateActor(existingActor.id, actorData);
        }
        return savedUser;
    }
    async create(userDto) {
        const user = this.usersRepository.create(userDto);
        const savedUser = await this.usersRepository.save(user);
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        const actorData = {
            preferredUsername: savedUser?.username,
            name: savedUser?.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/following`,
            summary: savedUser?.tagline,
            publicKey: publicKey,
        };
        await this.actorService.createActor(actorData);
        return savedUser;
    }
    async addFollower(username, followerDto) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const newFollower = this.followersRepository.create(followerDto);
        newFollower.user = user;
        user.followers.push(newFollower);
        await this.followersRepository.save(newFollower);
        await this.usersRepository.save(user);
        return this.toFollowerDto(newFollower);
    }
    async addFollowing(username, followingDto) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const newFollowing = this.followingRepository.create(followingDto);
        newFollowing.user = user;
        user.following.push(newFollowing);
        await this.followingRepository.save(newFollowing);
        await this.usersRepository.save(user);
        return this.toFollowingDto(newFollowing);
    }
    async removeFollowing(username, followingId) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const following = await this.followingRepository.findOne({ where: { id: followingId, user } });
        if (!following) {
            throw new common_1.NotFoundException('Following not found');
        }
        const follower = await this.followersRepository.findOne({ where: { username: following.username, user } });
        if (follower) {
            follower.isFollowing = false;
            await this.followersRepository.save(follower);
            console.log("follower:", follower);
        }
        else {
            console.log("follower not found");
        }
        user.following = user.following.filter(follow => follow.id !== followingId);
        await this.usersRepository.save(user);
        await this.followingRepository.delete(followingId);
    }
    async removeFollower(username, followerId) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const follower = await this.followersRepository.findOne({ where: { id: followerId, user } });
        if (!follower) {
            throw new common_1.NotFoundException('Follower not found');
        }
        user.followers = user.followers.filter(follow => follow.id !== followerId);
        await this.usersRepository.save(user);
        await this.followersRepository.delete(followerId);
    }
    async getFollowers(username) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.followers.map(follower => this.toFollowerDto(follower));
    }
    async getFollowing(username) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        console.log("user", user);
        return user.following.map(following => this.toFollowingDto(following));
    }
    async updateFollowerStatus(username, followerId, isFollowing) {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const follower = await this.followersRepository.findOne({
            where: { id: followerId, user },
        });
        if (!follower) {
            throw new common_1.NotFoundException('Follower not found');
        }
        follower.isFollowing = isFollowing;
        const updatedFollower = await this.followersRepository.save(follower);
        return this.toFollowerDto(updatedFollower);
    }
    toFollowerDto(feedItem) {
        return {
            id: feedItem.id,
            username: feedItem.username,
            name: feedItem.name,
            image: feedItem.image,
            isFollowing: feedItem.isFollowing,
        };
    }
    toFollowingDto(feedItem) {
        return {
            id: feedItem.id,
            username: feedItem.username,
            name: feedItem.name,
            image: feedItem.image,
        };
    }
};
exports.ProfileusersService = ProfileusersService;
exports.ProfileusersService = ProfileusersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(1, (0, typeorm_1.InjectRepository)(profilefeed_item_entity_1.ProfileFeedItem)),
    __param(2, (0, typeorm_1.InjectRepository)(follower_entity_1.Follower)),
    __param(3, (0, typeorm_1.InjectRepository)(follower_entity_1.Following)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        actor_service_1.ActorService])
], ProfileusersService);
//# sourceMappingURL=profileusers.service.js.map