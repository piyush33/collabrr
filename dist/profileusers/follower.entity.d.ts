import { ProfileUser } from './profileuser.entity';
import { Organization } from 'src/organization/organization.entity';
export declare class Follower {
    id: number;
    username: string;
    name: string;
    image: string;
    user: ProfileUser;
    organization: Organization;
    isFollowing: boolean;
}
export declare class Following {
    id: number;
    username: string;
    name: string;
    image: string;
    user: ProfileUser;
    organization: Organization;
}
