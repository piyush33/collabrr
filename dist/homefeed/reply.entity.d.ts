import { Comment } from './comment.entity';
export declare class Reply {
    id: number;
    username: string;
    image: string;
    reply: string;
    comment: Comment;
}
