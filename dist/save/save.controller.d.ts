import { SaveService } from './save.service';
import { ProfileUser } from '../profileusers/profileuser.entity';
export declare class SaveController {
    private readonly saveService;
    constructor(saveService: SaveService);
    saveItem(username: string, homefeedItemId: number): Promise<ProfileUser>;
    hasSaved(username: string, homefeedItemId: number): Promise<{
        hasSaved: boolean;
    }>;
    unSaveHomefeedItem(username: string, homefeedItemId: number): Promise<void>;
}
