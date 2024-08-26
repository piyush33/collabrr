import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    private homefeedRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<ProfileUser>, homefeedRepository: Repository<Homefeed>);
    createNotification(user: ProfileUser, homefeedItem: Homefeed, type: string, targetUser: ProfileUser): Promise<Notification>;
    getUserNotifications(username: string): Promise<Notification[]>;
    createLikeNotification(likingUser: ProfileUser, homefeedItem: Homefeed): Promise<void>;
    createRepostNotification(repostingUser: ProfileUser, homefeedItem: Homefeed): Promise<void>;
    createFollowedUserNotifications(mainUser: ProfileUser, homefeedItem: Homefeed, type: string): Promise<void>;
}
