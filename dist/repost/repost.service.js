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
exports.RepostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const repost_entity_1 = require("./repost.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const notification_service_1 = require("../notification/notification.service");
let RepostService = class RepostService {
    constructor(repostRepository, userRepository, homefeedRepository, notificationService) {
        this.repostRepository = repostRepository;
        this.userRepository = userRepository;
        this.homefeedRepository = homefeedRepository;
        this.notificationService = notificationService;
    }
    async repostItem(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        console.log('User found:', user);
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts', 'createdBy'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        console.log('Homefeed item found:', homefeedItem);
        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (existingRepost) {
            console.log('User already reposted this item');
            throw new common_1.ConflictException('User already reposted this item');
        }
        const repost = this.repostRepository.create({ user, homefeedItem });
        await this.repostRepository.save(repost);
        console.log('Repost saved:', repost);
        user.reposts.push(repost);
        await this.userRepository.save(user);
        console.log('User updated with new repost:', user);
        homefeedItem.reposts.push(repost);
        await this.homefeedRepository.save(homefeedItem);
        console.log('Homefeed item updated with new repost:', homefeedItem);
        await this.notificationService.createRepostNotification(user, homefeedItem);
        return user;
    }
    async hasReposted(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            console.log('User not found');
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        console.log('Existing repost found:', existingRepost);
        return !!existingRepost;
    }
    async unRepostItem(username, homefeedItemId) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts'] });
        if (!homefeedItem) {
            throw new common_1.NotFoundException('Feed item not found');
        }
        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingRepost) {
            throw new common_1.NotFoundException('Repost not found');
        }
        await this.repostRepository.remove(existingRepost);
        user.reposts = user.reposts.filter(repost => repost.id !== existingRepost.id);
        await this.userRepository.save(user);
        homefeedItem.reposts = homefeedItem.reposts.filter(repost => repost.id !== existingRepost.id);
        await this.homefeedRepository.save(homefeedItem);
    }
};
exports.RepostService = RepostService;
exports.RepostService = RepostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(repost_entity_1.Repost)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], RepostService);
//# sourceMappingURL=repost.service.js.map