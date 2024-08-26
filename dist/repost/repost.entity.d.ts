import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class Repost {
    id: number;
    user: ProfileUser;
    feedItem: ProfileFeedItem;
    homefeedItem: Homefeed;
}
