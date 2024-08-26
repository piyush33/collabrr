import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';

@Injectable()
export class ProfileFeedService {
    constructor(
        @InjectRepository(ProfileFeedItem)
        private profileFeedRepository: Repository<ProfileFeedItem>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
    ) { }

    findAll(): Promise<ProfileFeedItem[]> {
        return this.profileFeedRepository.find();
    }

    findOne(id: number): Promise<ProfileFeedItem> {
        return this.profileFeedRepository.findOne({ where: { id } });
    }

    async findAllByFeedType(username: string, feedType: string): Promise<ProfileFeedItemDto[]> {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });

        if (!user) {
            throw new NotFoundException('ProfileUser not found');
        }

        return user[feedType].map(item => this.toDto(item));
    }

    async create(username: string, createFeedItemDto: CreateProfileFeedItemDto, feedType: string): Promise<ProfileFeedItemDto> {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });

        if (!user) {
            throw new NotFoundException('ProfileUser not found');
        }

        const feedItem = this.profileFeedRepository.create(createFeedItemDto);
        feedItem.username = createFeedItemDto.username ? createFeedItemDto.username : username;
        console.log("feedItem:", feedItem);
        feedItem[`user${feedType.charAt(0).toUpperCase() + feedType.slice(1)}`] = user;

        if (!user[feedType]) {
            user[feedType] = [];
        }
        user[feedType].push(feedItem);

        await this.userRepository.save(user);
        const savedFeedItem = await this.profileFeedRepository.save(feedItem);

        return this.toDto(savedFeedItem);
    }

    async update(id: number, updateFeedItemDto: Partial<ProfileFeedItemDto>): Promise<ProfileFeedItemDto> {
        const feedItem = await this.findOne(id);
        Object.assign(feedItem, updateFeedItemDto);
        const updatedFeedItem = await this.profileFeedRepository.save(feedItem);
        return this.toDto(updatedFeedItem);
    }

    async delete(username: string, id: number, feedType: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username }, relations: [feedType] });

        if (!user) {
            throw new NotFoundException('ProfileUser not found');
        }

        // const feedItem = await this.profileFeedRepository.findOne({ where: { id } });
        // if (!feedItem) {
        //     throw new NotFoundException('Feed item not found');
        // }

        user[feedType] = user[feedType].filter(item => item.id !== id);
        await this.userRepository.save(user);

        await this.profileFeedRepository.delete(id);
    }

    private toDto(feedItem: ProfileFeedItem): ProfileFeedItemDto {
        return {
            id: feedItem.id,
            username: feedItem.username,
            title: feedItem.title,
            description: feedItem.description,
            image: feedItem.image,
            picture: feedItem.picture,
            text: feedItem.text,
            parent: feedItem.parent,
        };
    }
}
