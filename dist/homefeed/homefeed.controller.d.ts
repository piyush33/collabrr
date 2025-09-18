import { HomefeedService } from './homefeed.service';
import { Homefeed } from './homefeed.entity';
type CreateBody = Partial<Homefeed> & {
    allowedMemberIds?: number[];
};
export declare class HomefeedController {
    private readonly homefeedService;
    constructor(homefeedService: HomefeedService);
    getHomeFeed(orgId: number, username: string, limit?: string): Promise<Homefeed[]>;
    findOne(orgId: number, id: number, username: string): Promise<Homefeed>;
    create(orgId: number, username: string, body: CreateBody): Promise<Homefeed>;
    update(orgId: number, id: number, username: string, patch: Partial<Homefeed>): Promise<void>;
    remove(orgId: number, id: number, username: string): Promise<void>;
    getLayerCards(orgId: number, layerId: number, username: string, limit?: string): Promise<Homefeed[]>;
}
export {};
