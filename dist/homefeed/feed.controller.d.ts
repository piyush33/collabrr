import { FeedQuery, FeedService } from './feed.service';
export declare class FeedController {
    private readonly feed;
    constructor(feed: FeedService);
    private username;
    page(orgId: number, query: FeedQuery, req: any): Promise<import("./feed.service").FeedPage>;
    categories(orgId: number, req: any): Promise<{
        total: number;
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
    }>;
    lookup(orgId: number, query: {
        profileItemId?: string;
        title?: string;
        description?: string;
        author?: string;
    }, req: any): Promise<{
        id: number;
        layerId: number;
    }>;
}
