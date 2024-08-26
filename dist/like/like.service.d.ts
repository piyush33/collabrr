import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { NotificationService } from 'src/notification/notification.service';
export declare class LikeService {
    private likeRepository;
    private userRepository;
    private homefeedRepository;
    private notificationService;
    constructor(likeRepository: Repository<Like>, userRepository: Repository<ProfileUser>, homefeedRepository: Repository<Homefeed>, notificationService: NotificationService);
    likeItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasLiked(username: string, homefeedItemId: number): Promise<boolean>;
    unlikeItem(username: string, homefeedItemId: number): Promise<void>;
}
