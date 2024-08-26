import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private likeRepository: Repository<Like>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
        private notificationService: NotificationService,
    ) { }

    async likeItem(username: string, homefeedItemId: number): Promise<ProfileUser> {
        console.log(`Liking item: User: ${username}, Homefeed Item: ${homefeedItemId}`);

        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }
        console.log('User found:', user);

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes', 'createdBy'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
        }
        console.log('Homefeed item found:', homefeedItem);

        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (existingLike) {
            console.log('User already liked this item');
            throw new ConflictException('User already liked this item');
        }

        const like = this.likeRepository.create({ user, homefeedItem });
        await this.likeRepository.save(like);
        console.log('Like saved:', like);

        user.likes.push(like);
        await this.userRepository.save(user);
        console.log('User updated with new like:', user);

        homefeedItem.likes.push(like);
        await this.homefeedRepository.save(homefeedItem);
        console.log('Homefeed item updated with new like:', homefeedItem);

        await this.notificationService.createLikeNotification(user, homefeedItem);

        return user;
    }

    async hasLiked(username: string, homefeedItemId: number): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
        }

        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        console.log('Existing like found:', existingLike);
        return !!existingLike;
    }

    async unlikeItem(username: string, homefeedItemId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['likes'] });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['likes'] });
        if (!homefeedItem) {
            throw new NotFoundException('Feed item not found');
        }

        const existingLike = await this.likeRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingLike) {
            throw new NotFoundException('Like not found');
        }

        await this.likeRepository.remove(existingLike);

        // Remove the like from the user's likes array
        user.likes = user.likes.filter(like => like.id !== existingLike.id);
        await this.userRepository.save(user);

        // Remove the like from the homefeed item's likes array
        homefeedItem.likes = homefeedItem.likes.filter(like => like.id !== existingLike.id);
        await this.homefeedRepository.save(homefeedItem);
    }
}
