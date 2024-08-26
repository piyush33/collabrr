import { Repository } from 'typeorm';
import { ProfileUser } from './profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Follower, Following } from './follower.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';
export declare class ProfileusersService {
    private usersRepository;
    private profileFeedRepository;
    private followersRepository;
    private followingRepository;
    constructor(usersRepository: Repository<ProfileUser>, profileFeedRepository: Repository<ProfileFeedItem>, followersRepository: Repository<Follower>, followingRepository: Repository<Following>);
    findOne(username: string): Promise<ProfileUser>;
    update(username: string, updateUserDto: Partial<ProfileUser>): Promise<ProfileUser>;
    create(userDto: Partial<ProfileUser>): Promise<ProfileUser>;
    addFollower(username: string, followerDto: FollowerDto): Promise<FollowerDto>;
    addFollowing(username: string, followingDto: FollowingDto): Promise<FollowingDto>;
    removeFollowing(username: string, followingId: number): Promise<void>;
    removeFollower(username: string, followerId: number): Promise<void>;
    getFollowers(username: string): Promise<FollowerDto[]>;
    getFollowing(username: string): Promise<FollowingDto[]>;
    updateFollowerStatus(username: string, followerId: number, isFollowing: boolean): Promise<FollowerDto>;
    private toFollowerDto;
    private toFollowingDto;
}
