import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
export declare class FollowerDto {
    id: number;
    username: string;
    name: string;
    image: string;
    isFollowing: boolean;
}
export declare class FollowingDto {
    id: number;
    username: string;
    name: string;
    image: string;
}
export declare class UserDto {
    id: number;
    name: string;
    tagline: string;
    username: string;
    followers: FollowerDto[];
    following: FollowingDto[];
    created: ProfileFeedItem[];
    reposted: ProfileFeedItem[];
    liked: ProfileFeedItem[];
    saved: ProfileFeedItem[];
}
