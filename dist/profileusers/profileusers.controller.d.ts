import { ProfileusersService } from './profileusers.service';
import { ProfileUser } from './profileuser.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';
export declare class ProfileusersController {
    private readonly usersService;
    constructor(usersService: ProfileusersService);
    findOne(orgId: number, username: string): Promise<ProfileUser>;
    create(orgId: number, createUserDto: Partial<ProfileUser>): Promise<ProfileUser>;
    update(orgId: number, username: string, updateUserDto: Partial<ProfileUser>): Promise<ProfileUser>;
    addFollower(orgId: number, username: string, followerDto: FollowerDto): Promise<FollowerDto>;
    addFollowing(orgId: number, username: string, followingDto: FollowingDto): Promise<FollowingDto>;
    getFollowers(orgId: number, username: string): Promise<FollowerDto[]>;
    getFollowing(orgId: number, username: string): Promise<FollowingDto[]>;
    removeFollowing(orgId: number, username: string, followingId: number): Promise<void>;
    removeFollower(orgId: number, username: string, followerId: number): Promise<void>;
    updateFollowerStatus(orgId: number, username: string, followerId: number, isFollowing: boolean): Promise<FollowerDto>;
}
