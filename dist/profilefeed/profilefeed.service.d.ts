import { Repository } from 'typeorm';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
export declare class ProfileFeedService {
    private profileFeedRepository;
    private userRepository;
    constructor(profileFeedRepository: Repository<ProfileFeedItem>, userRepository: Repository<ProfileUser>);
    findAll(): Promise<ProfileFeedItem[]>;
    findOne(id: number): Promise<ProfileFeedItem>;
    findAllByFeedType(username: string, feedType: string): Promise<ProfileFeedItemDto[]>;
    create(username: string, createFeedItemDto: CreateProfileFeedItemDto, feedType: string): Promise<ProfileFeedItemDto>;
    update(id: number, updateFeedItemDto: Partial<ProfileFeedItemDto>): Promise<ProfileFeedItemDto>;
    delete(username: string, id: number, feedType: string): Promise<void>;
    private toDto;
}
