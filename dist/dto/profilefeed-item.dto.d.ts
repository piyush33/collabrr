import { User } from '../users/user.entity';
export declare class ProfileFeedItemDto {
    id: number;
    username: string;
    title: string;
    description: string;
    image?: string;
    picture?: string;
    text?: string;
    parent?: string;
    userCreated?: User;
    userReposted?: User;
    userLiked?: User;
    userSaved?: User;
}
