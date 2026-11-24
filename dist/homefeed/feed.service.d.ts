import { Repository } from 'typeorm';
import { Homefeed } from './homefeed.entity';
import { HomefeedService } from './homefeed.service';
export type FeedQuery = {
    cursor?: string;
    limit?: string;
    category?: string;
    phases?: string;
    roles?: string;
    q?: string;
    from?: string;
    to?: string;
    content?: string;
    author?: string;
};
export type FeedPage = {
    items: Homefeed[];
    nextCursor: number | null;
    total: number | null;
};
export declare class FeedService {
    private readonly homefeed;
    private readonly cards;
    constructor(homefeed: HomefeedService, cards: Repository<Homefeed>);
    private rawCategories;
    page(orgId: number, username: string, f: FeedQuery): Promise<FeedPage>;
    categories(orgId: number, username: string): Promise<{
        total: number;
        categories: {
            id: string;
            name: string;
            count: number;
        }[];
    }>;
    lookup(orgId: number, username: string, f: {
        profileItemId?: string;
        title?: string;
        description?: string;
        author?: string;
    }): Promise<{
        id: number;
        layerId: number;
    }>;
}
