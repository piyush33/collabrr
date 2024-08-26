import { RepostService } from './repost.service';
import { ProfileUser } from '../profileusers/profileuser.entity';
export declare class RepostController {
    private readonly repostService;
    constructor(repostService: RepostService);
    repostItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasReposted(username: string, homefeedItemId: number): Promise<{
        hasReposted: boolean;
    }>;
    unRepostHomefeedItem(username: string, homefeedItemId: number): Promise<void>;
}
