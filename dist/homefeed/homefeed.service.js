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
let HomefeedService = class HomefeedService {
    constructor(homefeedRepository, userInteractionRepository, profileUserRepository) {
        this.homefeedRepository = homefeedRepository;
        this.userInteractionRepository = userInteractionRepository;
        this.profileUserRepository = profileUserRepository;
    }
    findAll() {
        return this.homefeedRepository.find();
    }
    findOne(id) {
        return this.homefeedRepository.findOne({ where: { id } });
    }
    async create(homefeed, username) {
        const user = await this.profileUserRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        homefeed.createdBy = user;
        return this.homefeedRepository.save(homefeed);
    }
    async update(id, homefeed) {
        await this.homefeedRepository.update(id, homefeed);
    }
    async remove(id) {
        await this.homefeedRepository.delete(id);
    }
    async getHomeFeed(username) {
        const user = await this.profileUserRepository.findOne({ where: { username }, relations: ['following', 'createdPosts', 'likes', 'reposts'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        console.log("user:", user);
        const followingUsernames = user.following.map(f => f.username);
        let createdByFollowing = [], likedByFollowing = [], repostedByFollowing = [];
        if (followingUsernames.length !== 0) {
            createdByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.createdBy', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();
            console.log("createdByfollowing:", createdByFollowing);
            likedByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.likes', 'like')
                .leftJoinAndSelect('like.user', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();
            console.log("likedByfollowing:", likedByFollowing);
            repostedByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.reposts', 'repost')
                .leftJoinAndSelect('repost.user', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();
        }
        const likedIds = user.likes?.map(l => l.homefeedItem?.id).filter(id => id !== undefined);
        const repostIds = user.reposts?.map(r => r.homefeedItem?.id).filter(id => id !== undefined);
        const queryBuilder = this.homefeedRepository.createQueryBuilder('homefeed')
            .where('homefeed.createdBy = :userId', { userId: user?.id });
        if (likedIds && likedIds.length > 0) {
            queryBuilder.orWhere('homefeed.id IN (:...likedIds)', { likedIds });
        }
        if (repostIds && repostIds.length > 0) {
            queryBuilder.orWhere('homefeed.id IN (:...repostIds)', { repostIds });
        }
        const userPosts = await queryBuilder.getMany();
        console.log("userPosts", userPosts);
        const randomFeed = await this.fetchRandomItemsBasedOnUserPreferences(username);
        const combinedFeed = [...createdByFollowing, ...likedByFollowing, ...repostedByFollowing, ...userPosts, ...randomFeed];
        const uniqueFeed = Array.from(new Set(combinedFeed.map(item => item.id)))
            .map(id => combinedFeed.find(item => item.id === id));
        return uniqueFeed;
    }
    async fetchRandomItemsBasedOnUserPreferences(username) {
        const user = await this.profileUserRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userInteractions = await this.userInteractionRepository.find({ where: { user } });
        const interactedItemIds = userInteractions.map(interaction => interaction.homefeedItem?.id);
        let similarUsersInteractions = [];
        if (interactedItemIds.length > 0) {
            similarUsersInteractions = await this.userInteractionRepository.createQueryBuilder('interaction')
                .leftJoinAndSelect('interaction.user', 'user')
                .where('interaction.homefeedItem IN (:...interactedItemIds)', { interactedItemIds })
                .andWhere('user.id != :userId', { userId: user.id })
                .getMany();
        }
        const similarUserIds = similarUsersInteractions.map(interaction => interaction.user.id);
        if (similarUserIds.length === 0) {
            return this.homefeedRepository.createQueryBuilder('homefeed')
                .orderBy('RANDOM()')
                .limit(10)
                .getMany();
        }
        let recommendedItems = [];
        if (similarUserIds.length > 0) {
            recommendedItems = await this.userInteractionRepository.createQueryBuilder('interaction')
                .leftJoinAndSelect('interaction.homefeedItem', 'homefeed')
                .where('interaction.user IN (:...similarUserIds)', { similarUserIds })
                .andWhere('homefeed.id NOT IN (:...interactedItemIds)', { interactedItemIds })
                .groupBy('homefeed.id')
                .orderBy('COUNT(interaction.id)', 'DESC')
                .limit(10)
                .getMany();
        }
        let homefeedItems = recommendedItems.map(interaction => interaction.homefeedItem);
        if (homefeedItems.length < 10) {
            const additionalItems = await this.homefeedRepository.createQueryBuilder('homefeed')
                .where('homefeed.id NOT IN (:...interactedItemIds)', { interactedItemIds: interactedItemIds.length > 0 ? interactedItemIds : [-1] })
                .orderBy('RANDOM()')
                .limit(10 - homefeedItems.length)
                .getMany();
            homefeedItems.push(...additionalItems);
        }
        return homefeedItems;
    }
};
exports.HomefeedService = HomefeedService;
exports.HomefeedService = HomefeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __param(1, (0, typeorm_1.InjectRepository)(user_interaction_entity_1.UserInteraction)),
    __param(2, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HomefeedService);
//# sourceMappingURL=homefeed.service.js.map