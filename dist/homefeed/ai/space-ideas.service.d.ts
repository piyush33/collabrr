import { Repository } from 'typeorm';
import { OrgAiResult } from './org-ai-result.entity';
import { LayerSummary } from '../layer-summary.entity';
import { HomefeedService } from '../homefeed.service';
import type { AiJobView } from './ai.service';
export type IdeasBody = {
    category?: unknown;
    categoryName?: unknown;
    categoryDescription?: unknown;
    force?: boolean;
};
export declare class SpaceIdeasService {
    private readonly rows;
    private readonly summaries;
    private readonly homefeed;
    private readonly running;
    constructor(rows: Repository<OrgAiResult>, summaries: Repository<LayerSummary>, homefeed: HomefeedService);
    private scopeOf;
    private find;
    private isLive;
    private topics;
    start(orgId: number, username: string, body: IdeasBody): Promise<AiJobView>;
    status(orgId: number, username: string, category: unknown, signature: unknown): Promise<AiJobView>;
    private run;
    private prune;
}
