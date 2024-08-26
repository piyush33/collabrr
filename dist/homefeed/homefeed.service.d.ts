import { Repository } from 'typeorm';
import { Homefeed } from './homefeed.entity';
import { UserInteraction } from './user-interaction.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare class HomefeedService {
    private homefeedRepository;
    private userInteractionRepository;
    private profileUserRepository;
    constructor(homefeedRepository: Repository<Homefeed>, userInteractionRepository: Repository<UserInteraction>, profileUserRepository: Repository<ProfileUser>);
    findAll(): Promise<Homefeed[]>;
    findOne(id: number): Promise<Homefeed>;
    create(homefeed: Homefeed, username: string): Promise<Homefeed>;
    update(id: number, homefeed: Homefeed): Promise<void>;
    remove(id: number): Promise<void>;
    getHomeFeed(username: string): Promise<Homefeed[]>;
    private fetchRandomItemsBasedOnUserPreferences;
}
