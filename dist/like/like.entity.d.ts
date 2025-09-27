import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Organization } from 'src/organization/organization.entity';
export declare class Like {
    id: number;
    user: ProfileUser;
    feedItem: ProfileFeedItem;
    homefeedItem: Homefeed;
    organization?: Organization;
}
