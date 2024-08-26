import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItem } from './profilefeed-item.entity';
export declare class ProfileFeedController {
    private readonly profileFeedService;
    constructor(profileFeedService: ProfileFeedService);
    findAll(): Promise<ProfileFeedItem[]>;
    findOne(id: number): Promise<ProfileFeedItem>;
    findAllByFeedType(username: string, feedType: string): Promise<ProfileFeedItemDto[]>;
    create(username: string, feedType: string, createFeedItemDto: CreateProfileFeedItemDto): Promise<ProfileFeedItemDto>;
    update(id: number, updateFeedItemDto: Partial<CreateProfileFeedItemDto>): Promise<ProfileFeedItemDto>;
    deleteProfileFeedItem(username: string, feedType: string, id: number): Promise<void>;
}
