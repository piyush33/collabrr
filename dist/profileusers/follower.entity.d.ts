import { ProfileUser } from './profileuser.entity';
export declare class Follower {
    id: number;
    username: string;
    name: string;
    image: string;
    user: ProfileUser;
    isFollowing: Boolean;
}
export declare class Following {
    id: number;
    username: string;
    name: string;
    image: string;
    user: ProfileUser;
}
