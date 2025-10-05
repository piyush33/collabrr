import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';
import { User } from '../users/user.entity';
export declare class ProfileFeedItemDto {
    id: number;
    username: string;
    title: string;
    description: string;
    image?: string;
    picture?: string;
    text?: string;
    layerKey?: number;
    lock: boolean;
    privacy: boolean;
    userCreated?: User;
    userReposted?: User;
    userLiked?: User;
    userSaved?: User;
    phase?: Phase | null;
    roleTypes: RoleType[];
}
