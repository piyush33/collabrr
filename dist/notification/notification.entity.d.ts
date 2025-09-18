import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Organization } from 'src/organization/organization.entity';
export declare class Notification {
    id: number;
    type: string;
    organization: Organization;
    user: ProfileUser;
    homefeedItem: Homefeed;
    targetUser: ProfileUser;
    createdAt: Date;
    readAt: Date | null;
    get isRead(): boolean;
}
