import { HomefeedService } from './homefeed.service';
import { Homefeed } from './homefeed.entity';
export declare class HomefeedController {
    private readonly homefeedService;
    constructor(homefeedService: HomefeedService);
    findAll(): Promise<Homefeed[]>;
    getHomeFeed(username: string): Promise<Homefeed[]>;
    findOne(id: number): Promise<Homefeed>;
    create(username: string, homefeed: Homefeed): Promise<Homefeed>;
    update(id: number, homefeed: Homefeed): Promise<void>;
    remove(id: number): Promise<void>;
}
