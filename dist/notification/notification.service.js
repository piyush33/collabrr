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
let NotificationService = class NotificationService {
    constructor(notificationRepository, userRepository, homefeedRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.homefeedRepository = homefeedRepository;
    }
    async createNotification(user, homefeedItem, type, targetUser) {
        const notification = this.notificationRepository.create({ user, homefeedItem, type, targetUser });
        return this.notificationRepository.save(notification);
    }
    async getUserNotifications(username) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['notificationsReceived', 'notificationsReceived.homefeedItem', 'notificationsReceived.user'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.notificationsReceived;
    }
    async createLikeNotification(likingUser, homefeedItem) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser.id !== likingUser.id) {
            await this.createNotification(likingUser, homefeedItem, 'liked', targetUser);
        }
    }
    async createRepostNotification(repostingUser, homefeedItem) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser.id !== repostingUser.id) {
            await this.createNotification(repostingUser, homefeedItem, 'reposted', targetUser);
        }
    }
    async createFollowedUserNotifications(mainUser, homefeedItem, type) {
        const followedUsers = await this.userRepository.find({ where: { following: { id: mainUser.id } } });
        for (const user of followedUsers) {
            if (user.id !== mainUser.id) {
                await this.createNotification(mainUser, homefeedItem, type, user);
            }
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map