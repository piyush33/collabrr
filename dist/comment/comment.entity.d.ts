import { Homefeed } from '../homefeed/homefeed.entity';
import { Reply } from './reply.entity';
export declare class Comment {
    id: number;
    username: string;
    image: string;
    comment: string;
    homefeedItem: Homefeed;
    replies: Reply[];
}
