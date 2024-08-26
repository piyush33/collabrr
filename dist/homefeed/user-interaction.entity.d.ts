import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class UserInteraction {
    id: number;
    user: ProfileUser;
    homefeedItem: Homefeed;
    interactionType: string;
}
