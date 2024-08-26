import { LikeService } from './like.service';
import { ProfileUser } from '../profileusers/profileuser.entity';
export declare class LikeController {
    private readonly likeService;
    constructor(likeService: LikeService);
    likeItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasLiked(username: string, homefeedItemId: number): Promise<{
        hasLiked: boolean;
    }>;
    unlikeHomefeedItem(username: string, homefeedItemId: number): Promise<void>;
}
