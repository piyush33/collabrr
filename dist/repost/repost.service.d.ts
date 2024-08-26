import { Repository } from 'typeorm';
import { Repost } from './repost.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { NotificationService } from 'src/notification/notification.service';
export declare class RepostService {
    private repostRepository;
    private userRepository;
    private homefeedRepository;
    private notificationService;
    constructor(repostRepository: Repository<Repost>, userRepository: Repository<ProfileUser>, homefeedRepository: Repository<Homefeed>, notificationService: NotificationService);
    repostItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasReposted(username: string, homefeedItemId: number): Promise<boolean>;
    unRepostItem(username: string, homefeedItemId: number): Promise<void>;
}
