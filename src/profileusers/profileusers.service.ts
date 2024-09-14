import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileUser } from './profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Follower, Following } from './follower.entity';
import { FollowerDto, FollowingDto } from 'src/dto/profileuser.dto';
import { ActorService } from 'src/actor/actor.service';
import { Actor } from 'src/actor/actor.entity';
import { generateKeyPairSync } from 'crypto';


@Injectable()
export class ProfileusersService {
    constructor(
        @InjectRepository(ProfileUser)
        private usersRepository: Repository<ProfileUser>,
        @InjectRepository(ProfileFeedItem)
        private profileFeedRepository: Repository<ProfileFeedItem>,
        @InjectRepository(Follower)
        private followersRepository: Repository<Follower>,
        @InjectRepository(Following)
        private followingRepository: Repository<Following>,
        private readonly actorService: ActorService,
    ) { }

    findOne(username: string): Promise<ProfileUser> {
        return this.usersRepository.findOne({ where: { username }, relations: ['created', 'reposted', 'liked', 'saved'] });
    }

    async update(username: string, updateUserDto: Partial<ProfileUser>): Promise<ProfileUser> {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        Object.assign(user, updateUserDto);
        const savedUser = await this.usersRepository.save(user);

        // Step 2: Create Actor for the created ProfileUser
        const actorData: any = {
            preferredUsername: savedUser?.username,
            name: savedUser?.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/following`,
            summary: savedUser?.tagline, // Use the bio of the ProfileUser for the Actor summary
        };

        const existingActor = await this.actorService.findByUsername(username);
        if (existingActor) {
            await this.actorService.updateActor(existingActor.id, actorData);
        }

        return savedUser;
    }

    async create(userDto: Partial<ProfileUser>): Promise<ProfileUser> {
        const user = this.usersRepository.create(userDto);
        const savedUser = await this.usersRepository.save(user);

        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        // Step 2: Create Actor for the created ProfileUser
        const actorData: any = {
            preferredUsername: savedUser?.username,
            name: savedUser?.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${savedUser?.username}/following`,
            summary: savedUser?.tagline, // Use the bio of the ProfileUser for the Actor summary
            publicKey: publicKey,
        };

        await this.actorService.createActor(actorData); // Call ActorService to create an Actor

        return savedUser;
    }

    async addFollower(username: string, followerDto: FollowerDto): Promise<FollowerDto> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newFollower = this.followersRepository.create(followerDto);
        newFollower.user = user;

        user.followers.push(newFollower);

        await this.followersRepository.save(newFollower);
        await this.usersRepository.save(user);

        return this.toFollowerDto(newFollower);
    }


    async addFollowing(username: string, followingDto: FollowingDto): Promise<FollowingDto> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newFollowing = this.followingRepository.create(followingDto);
        newFollowing.user = user;

        user.following.push(newFollowing);

        await this.followingRepository.save(newFollowing);
        await this.usersRepository.save(user);

        return this.toFollowingDto(newFollowing);
    }

    async removeFollowing(username: string, followingId: number): Promise<void> {
        // Find the user and load their 'following' relationship
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Find the specific 'Following' entry to be removed
        const following = await this.followingRepository.findOne({ where: { id: followingId, user } });
        if (!following) {
            throw new NotFoundException('Following not found');
        }

        // Update the corresponding Follower's isFollowing to false
        const follower = await this.followersRepository.findOne({ where: { username: following.username, user } });
        if (follower) {
            follower.isFollowing = false;
            await this.followersRepository.save(follower);
            console.log("follower:", follower);

        }
        else {
            console.log("follower not found");
        }

        // Remove the following from the user's 'following' array
        user.following = user.following.filter(follow => follow.id !== followingId);

        // Save the updated user to ensure the removal of the relationship
        await this.usersRepository.save(user);

        // Delete the 'Following' entry from the database
        await this.followingRepository.delete(followingId);
    }

    async removeFollower(username: string, followerId: number): Promise<void> {
        // Find the user and load their 'followers' relationship
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Find the specific 'Follower' entry to be removed
        const follower = await this.followersRepository.findOne({ where: { id: followerId, user } });
        if (!follower) {
            throw new NotFoundException('Follower not found');
        }

        // Remove the follower from the user's 'followers' array
        user.followers = user.followers.filter(follow => follow.id !== followerId);

        // Save the updated user to ensure the removal of the relationship
        await this.usersRepository.save(user);

        // Delete the 'Follower' entry from the database
        await this.followersRepository.delete(followerId);
    }


    async getFollowers(username: string): Promise<FollowerDto[]> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user.followers.map(follower => this.toFollowerDto(follower));
    }

    async getFollowing(username: string): Promise<FollowingDto[]> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['following'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        console.log("user", user);

        return user.following.map(following => this.toFollowingDto(following));
    }

    async updateFollowerStatus(username: string, followerId: number, isFollowing: boolean): Promise<FollowerDto> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: ['followers'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const follower = await this.followersRepository.findOne({
            where: { id: followerId, user },
        });

        if (!follower) {
            throw new NotFoundException('Follower not found');
        }

        follower.isFollowing = isFollowing;
        const updatedFollower = await this.followersRepository.save(follower);

        return this.toFollowerDto(updatedFollower);
    }


    private toFollowerDto(feedItem: Follower): FollowerDto {
        return {
            id: feedItem.id,
            username: feedItem.username,
            name: feedItem.name,
            image: feedItem.image,
            isFollowing: feedItem.isFollowing,
        };
    }

    private toFollowingDto(feedItem: Following): FollowingDto {
        return {
            id: feedItem.id,
            username: feedItem.username,
            name: feedItem.name,
            image: feedItem.image,
        };
    }

    // async addProfileFeedItem(username: string, feedItemData: Partial<ProfileFeedItem>, feedType: string): Promise<ProfileFeedItem> {
    //     const user = await this.findOne(username);
    //     if (!user) {
    //         throw new NotFoundException('User not found');
    //     }
    //     const feedItem = this.profileFeedRepository.create(feedItemData);
    //     feedItem.user = user;
    //     user[feedType].push(feedItem);
    //     await this.usersRepository.save(user);
    //     return this.profileFeedRepository.save(feedItem);
    // }
}
