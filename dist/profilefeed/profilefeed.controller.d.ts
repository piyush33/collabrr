import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedItemDto } from '../dto/profilefeed-item.dto';
import { CreateProfileFeedItemDto } from '../dto/create-profilefeed-item.dto';
import { ProfileFeedItem } from './profilefeed-item.entity';
export declare class ProfileFeedController {
    private readonly profileFeedService;
    constructor(profileFeedService: ProfileFeedService);
    findAll(orgId: number): Promise<ProfileFeedItem[]>;
    findOne(orgId: number, id: number): Promise<ProfileFeedItem>;
    findAllByFeedType(orgId: number, subjectUsername: string, feedType: string, req: any): Promise<ProfileFeedItemDto[]>;
    create(orgId: number, username: string, feedType: string, createFeedItemDto: CreateProfileFeedItemDto): Promise<ProfileFeedItemDto>;
    update(orgId: number, id: number, updateFeedItemDto: Partial<CreateProfileFeedItemDto>): Promise<ProfileFeedItemDto>;
    deleteProfileFeedItem(orgId: number, username: string, feedType: string, id: number): Promise<void>;
}
