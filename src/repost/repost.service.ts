import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repost } from './repost.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class RepostService {
    constructor(
        @InjectRepository(Repost)
        private repostRepository: Repository<Repost>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
        @InjectRepository(Homefeed)
        private homefeedRepository: Repository<Homefeed>,
        private notificationService: NotificationService,
    ) { }

    async repostItem(username: string, homefeedItemId: number): Promise<ProfileUser> {

        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }
        console.log('User found:', user);

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts', 'createdBy'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
        }
        console.log('Homefeed item found:', homefeedItem);

        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (existingRepost) {
            console.log('User already reposted this item');
            throw new ConflictException('User already reposted this item');
        }

        const repost = this.repostRepository.create({ user, homefeedItem });
        await this.repostRepository.save(repost);
        console.log('Repost saved:', repost);

        user.reposts.push(repost);
        await this.userRepository.save(user);
        console.log('User updated with new repost:', user);

        homefeedItem.reposts.push(repost);
        await this.homefeedRepository.save(homefeedItem);
        console.log('Homefeed item updated with new repost:', homefeedItem);

        await this.notificationService.createRepostNotification(user, homefeedItem);

        return user;
    }

    async hasReposted(username: string, homefeedItemId: number): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            console.log('User not found');
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts'] });
        if (!homefeedItem) {
            console.log('Feed item not found');
            throw new NotFoundException('Feed item not found');
        }

        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        console.log('Existing repost found:', existingRepost);
        return !!existingRepost;
    }

    async unRepostItem(username: string, homefeedItemId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['reposts'] });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const homefeedItem = await this.homefeedRepository.findOne({ where: { id: homefeedItemId }, relations: ['reposts'] });
        if (!homefeedItem) {
            throw new NotFoundException('Feed item not found');
        }

        const existingRepost = await this.repostRepository.findOne({
            where: {
                user: { id: user.id },
                homefeedItem: { id: homefeedItem.id },
            },
        });
        if (!existingRepost) {
            throw new NotFoundException('Repost not found');
        }

        await this.repostRepository.remove(existingRepost);

        // Remove the repost from the user's reposts array
        user.reposts = user.reposts.filter(repost => repost.id !== existingRepost.id);
        await this.userRepository.save(user);

        // Remove the repost from the homefeed item's reposts array
        homefeedItem.reposts = homefeedItem.reposts.filter(repost => repost.id !== existingRepost.id);
        await this.homefeedRepository.save(homefeedItem);
    }
}
