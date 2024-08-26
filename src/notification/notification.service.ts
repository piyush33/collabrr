import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
    ) { }

    async createNotification(user: ProfileUser, homefeedItem: Homefeed, type: string, targetUser: ProfileUser): Promise<Notification> {
        const notification = this.notificationRepository.create({ user, homefeedItem, type, targetUser });
        return this.notificationRepository.save(notification);
    }

    async getUserNotifications(username: string): Promise<Notification[]> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['notificationsReceived', 'notificationsReceived.homefeedItem', 'notificationsReceived.user'] });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user.notificationsReceived;
    }

    async createLikeNotification(likingUser: ProfileUser, homefeedItem: Homefeed) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser.id !== likingUser.id) {
            await this.createNotification(likingUser, homefeedItem, 'liked', targetUser);
        }
    }

    async createRepostNotification(repostingUser: ProfileUser, homefeedItem: Homefeed) {
        const targetUser = homefeedItem.createdBy;
        if (targetUser.id !== repostingUser.id) {
            await this.createNotification(repostingUser, homefeedItem, 'reposted', targetUser);
        }
    }

    async createFollowedUserNotifications(mainUser: ProfileUser, homefeedItem: Homefeed, type: string) {
        const followedUsers = await this.userRepository.find({ where: { following: { id: mainUser.id } } });

        for (const user of followedUsers) {
            if (user.id !== mainUser.id) {
                await this.createNotification(mainUser, homefeedItem, type, user);
            }
        }
    }
}
