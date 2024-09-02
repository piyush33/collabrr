import { User } from '../users/user.entity';

export class ProfileFeedItemDto {
    id: number;
    username: string;
    title: string;
    description: string;
    image?: string;
    picture?: string;
    text?: string;
    parent?: string;
    lock: boolean;
    privacy: boolean;
    userCreated?: User;
    userReposted?: User;
    userLiked?: User;
    userSaved?: User;
}
