import { ProfileusersService } from './profileusers.service';
import { ProfileUser } from './profileuser.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';
export declare class ProfileusersController {
    private readonly usersService;
    constructor(usersService: ProfileusersService);
    findOne(username: string): Promise<ProfileUser>;
    create(createUserDto: Partial<ProfileUser>): Promise<ProfileUser>;
    update(username: string, updateUserDto: Partial<ProfileUser>): Promise<ProfileUser>;
    addFollower(username: string, followerDto: FollowerDto): Promise<FollowerDto>;
    addFollowing(username: string, followingDto: FollowingDto): Promise<FollowingDto>;
    getFollowers(username: string): Promise<FollowerDto[]>;
    getFollowing(username: string): Promise<FollowingDto[]>;
    removeFollowing(username: string, followingId: number): Promise<void>;
    removeFollower(username: string, followerId: number): Promise<void>;
    updateFollowerStatus(username: string, followerId: number, isFollowing: boolean): Promise<FollowerDto>;
}
