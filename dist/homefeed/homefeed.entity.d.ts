import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Comment } from '../comment/comment.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UserInteraction } from './user-interaction.entity';
import { Notification } from 'src/notification/notification.entity';
import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from './linked-card-layer.entity';
import { Team } from 'src/organization/team.entity';
export declare enum Visibility {
    ORG = "org",
    LAYER = "layer",
    PRIVATE = "private",
    TEAM = "team"
}
export declare class Homefeed {
    id: number;
    username: string;
    title: string;
    description: string;
    image: string;
    picture: string;
    text: string;
    team?: Team;
    organization: Organization;
    layer?: LinkedCardLayer;
    visibility: Visibility;
    category: string;
    weblink: string;
    lock: boolean;
    privacy: boolean;
    createdAt: Date;
    likes: Like[];
    reposts: Repost[];
    saves: Save[];
    comments: Comment[];
    interactions: UserInteraction[];
    createdBy: ProfileUser;
    notifications: Notification[];
}
