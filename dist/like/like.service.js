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
exports.LikeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const like_entity_1 = require("./like.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const notification_service_1 = require("../notification/notification.service");
let LikeService = class LikeService {
    constructor(likeRepository, userRepository, homefeedRepository, notificationService) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.homefeedRepository = homefeedRepository;
        this.notificationService = notificationService;
    }
    async likeItem(username, homefeedItemId) {
        console.log(`Liking item: User: ${username}, Homefeed Item: ${homefeedItemId}`);
        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        console.log('User found:', user);
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes', 'createdBy'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        console.log('Homefeed item found:', homefeedItem);
        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (existingLike) {
            console.log('User already liked this item');
            throw new common_1.ConflictException('User already liked this item');
        }
        const like = this.likeRepository.create({ user, homefeedItem });
        await this.likeRepository.save(like);
        console.log('Like saved:', like);
        user.likes.push(like);
        await this.userRepository.save(user);
        console.log('User updated with new like:', user);
        homefeedItem.likes.push(like);
        await this.homefeedRepository.save(homefeedItem);
        console.log('Homefeed item updated with new like:', homefeedItem);
        await this.notificationService.createLikeNotification(user, homefeedItem);
        return user;
    }
    async hasLiked(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        console.log('Existing like found:', existingLike);
        return !!existingLike;
    }
    async unlikeItem(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes'] });
        if (!homefeedItem) {
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingLike) {
            throw new common_1.NotFoundException('Like not found');
        }
        await this.likeRepository.remove(existingLike);
        user.likes = user.likes.filter(like => like.id !== existingLike.id);
        await this.userRepository.save(user);
        homefeedItem.likes = homefeedItem.likes.filter(like => like.id !== existingLike.id);
        await this.homefeedRepository.save(homefeedItem);
    }
};
exports.LikeService = LikeService;
exports.LikeService = LikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], LikeService);
//# sourceMappingURL=like.service.js.map