import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homefeed } from './homefeed.entity';
import { UserInteraction } from './user-interaction.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

@Injectable()
export class HomefeedService {
    constructor(
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
        @InjectRepository(UserInteraction)
        private userInteractionRepository: Repository<UserInteraction>,
        @InjectRepository(ProfileUser)
        private profileUserRepository: Repository<ProfileUser>,
    ) { }

    findAll(): Promise<Homefeed[]> {
        return this.homefeedRepository.find();
    }

    findOne(id: number): Promise<Homefeed> {
        return this.homefeedRepository.findOne({ where: { id } });
    }

    async create(homefeed: Homefeed, username: string): Promise<Homefeed> {
        const user = await this.profileUserRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        homefeed.createdBy = user; // Set the createdBy field

        return this.homefeedRepository.save(homefeed);
    }


    async update(id: number, homefeed: Homefeed): Promise<void> {
        await this.homefeedRepository.update(id, homefeed);
    }

    async remove(id: number): Promise<void> {
        await this.homefeedRepository.delete(id);
    }

    async getHomeFeed(username: string): Promise<Homefeed[]> {
        const user = await this.profileUserRepository.findOne({ where: { username }, relations: ['following', 'createdPosts', 'likes', 'reposts'] });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        console.log("user:", user);

        // Get the list of users that the current user is following
        const followingUsernames = user.following.map(f => f.username);

        let createdByFollowing = [], likedByFollowing = [], repostedByFollowing = [];

        if (followingUsernames.length !== 0) {


            // Fetch posts created by the followed users
            createdByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.createdBy', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();

            console.log("createdByfollowing:", createdByFollowing);

            // Fetch posts liked by the followed users
            likedByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.likes', 'like')
                .leftJoinAndSelect('like.user', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();

            console.log("likedByfollowing:", likedByFollowing);

            // Fetch posts reposted by the followed users
            repostedByFollowing = await this.homefeedRepository.createQueryBuilder('homefeed')
                .leftJoinAndSelect('homefeed.reposts', 'repost')
                .leftJoinAndSelect('repost.user', 'user')
                .where('user.username IN (:...following)', { following: followingUsernames })
                .getMany();

        }

        // Fetch the user's own created, liked, and reposted posts
        const likedIds = user.likes?.map(l => l.homefeedItem?.id).filter(id => id !== undefined);
        const repostIds = user.reposts?.map(r => r.homefeedItem?.id).filter(id => id !== undefined);

        const queryBuilder = this.homefeedRepository.createQueryBuilder('homefeed')
            .where('homefeed.createdBy = :userId', { userId: user?.id });

        if (likedIds && likedIds.length > 0) {
            queryBuilder.orWhere('homefeed.id IN (:...likedIds)', { likedIds });
        }

        if (repostIds && repostIds.length > 0) {
            queryBuilder.orWhere('homefeed.id IN (:...repostIds)', { repostIds });
        }

        const userPosts = await queryBuilder.getMany();


        console.log("userPosts", userPosts);

        // Fetch random items using collaborative filtering
        const randomFeed = await this.fetchRandomItemsBasedOnUserPreferences(username);

        // Combine all sources into a single feed
        const combinedFeed = [...createdByFollowing, ...likedByFollowing, ...repostedByFollowing, ...userPosts, ...randomFeed];

        // Remove duplicates if any
        const uniqueFeed = Array.from(new Set(combinedFeed.map(item => item.id)))
            .map(id => combinedFeed.find(item => item.id === id));

        return uniqueFeed;
    }

    private async fetchRandomItemsBasedOnUserPreferences(username: string): Promise<Homefeed[]> {
        const user = await this.profileUserRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userInteractions = await this.userInteractionRepository.find({ where: { user } });
        const interactedItemIds = userInteractions.map(interaction => interaction.homefeedItem?.id);



        // If interactedItemIds is empty, bypass the query or handle it differently
        let similarUsersInteractions = [];
        if (interactedItemIds.length > 0) {
            similarUsersInteractions = await this.userInteractionRepository.createQueryBuilder('interaction')
                .leftJoinAndSelect('interaction.user', 'user')
                .where('interaction.homefeedItem IN (:...interactedItemIds)', { interactedItemIds })
                .andWhere('user.id != :userId', { userId: user.id })
                .getMany();
        }

        const similarUserIds = similarUsersInteractions.map(interaction => interaction.user.id);

        if (similarUserIds.length === 0) {
            return this.homefeedRepository.createQueryBuilder('homefeed')
                .orderBy('RANDOM()')
                .limit(10)
                .getMany();
        }

        let recommendedItems = [];
        if (similarUserIds.length > 0) {
            recommendedItems = await this.userInteractionRepository.createQueryBuilder('interaction')
                .leftJoinAndSelect('interaction.homefeedItem', 'homefeed')
                .where('interaction.user IN (:...similarUserIds)', { similarUserIds })
                .andWhere('homefeed.id NOT IN (:...interactedItemIds)', { interactedItemIds })
                .groupBy('homefeed.id')
                .orderBy('COUNT(interaction.id)', 'DESC')
                .limit(10)
                .getMany();
        }

        let homefeedItems = recommendedItems.map(interaction => interaction.homefeedItem);

        if (homefeedItems.length < 10) {
            const additionalItems = await this.homefeedRepository.createQueryBuilder('homefeed')
                .where('homefeed.id NOT IN (:...interactedItemIds)', { interactedItemIds: interactedItemIds.length > 0 ? interactedItemIds : [-1] })
                .orderBy('RANDOM()')
                .limit(10 - homefeedItems.length)
                .getMany();

            homefeedItems.push(...additionalItems);
        }

        return homefeedItems;
    }

}
