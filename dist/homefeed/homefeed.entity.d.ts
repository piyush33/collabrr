import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Comment } from '../comment/comment.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UserInteraction } from './user-interaction.entity';
import { Notification } from 'src/notification/notification.entity';
export declare class Homefeed {
    id: number;
    username: string;
    title: string;
    description: string;
    image: string;
    picture: string;
    text: string;
    parent: string;
    weblink: string;
    createdAt: Date;
    likes: Like[];
    reposts: Repost[];
    saves: Save[];
    comments: Comment[];
    interactions: UserInteraction[];
    createdBy: ProfileUser;
    notifications: Notification[];
}
