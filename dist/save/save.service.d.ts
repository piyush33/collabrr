import { Repository } from 'typeorm';
import { Save } from './save.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
export declare class SaveService {
    private saveRepository;
    private userRepository;
    private homefeedRepository;
    constructor(saveRepository: Repository<Save>, userRepository: Repository<ProfileUser>, homefeedRepository: Repository<Homefeed>);
    saveItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasSaved(username: string, homefeedItemId: number): Promise<boolean>;
    unSaveItem(username: string, homefeedItemId: number): Promise<void>;
}
