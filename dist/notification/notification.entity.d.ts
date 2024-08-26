import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class Notification {
    id: number;
    type: string;
    user: ProfileUser;
    homefeedItem: Homefeed;
    targetUser: ProfileUser;
    createdAt: Date;
}
