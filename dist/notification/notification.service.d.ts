import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    private homefeedRepository;
    private orgMemberRepo;
    private layerMemberRepo;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<ProfileUser>, homefeedRepository: Repository<Homefeed>, orgMemberRepo: Repository<OrganizationMember>, layerMemberRepo: Repository<LayerMember>);
    private getUserByUsername;
    private assertOrgMember;
    private assertLayerMember;
    createNotification(actor: ProfileUser, homefeedItem: Homefeed, type: string, targetUser: ProfileUser): Promise<Notification>;
    createLikeNotification(likingUser: ProfileUser, homefeedItem: Homefeed): Promise<void>;
    createRepostNotification(repostingUser: ProfileUser, homefeedItem: Homefeed): Promise<void>;
    getOrgUserNotifications(orgId: number, username: string): Promise<Notification[]>;
    getLayerUserNotifications(layerId: number, username: string): Promise<Notification[]>;
    createMentionNotifications(actor: ProfileUser, item: Homefeed): Promise<void>;
    getUnreadCount(orgId: number, username: string): Promise<number>;
    markAllRead(orgId: number, username: string): Promise<number>;
    markOneRead(orgId: number, username: string, id: number): Promise<void>;
}
