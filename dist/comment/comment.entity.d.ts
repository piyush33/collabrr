import { Homefeed } from '../homefeed/homefeed.entity';
import { Reply } from './reply.entity';
import { Organization } from 'src/organization/organization.entity';
export declare class Comment {
    id: number;
    username: string;
    image: string;
    comment: string;
    organization: Organization;
    homefeedItem: Homefeed;
    replies: Reply[];
}
