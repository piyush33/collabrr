import { Repository } from 'typeorm';
import { AiJob } from './ai-job.entity';
import { LayerSummary } from '../layer-summary.entity';
import { LayerSummaryService } from '../layer-summary.service';
import { HomefeedService } from '../homefeed.service';
import { SpaceBody } from './ai-prompts';
export type AiJobView = {
    status: 'done';
    signature: string;
    result: Record<string, unknown>;
} | {
    status: 'pending';
    signature: string;
} | {
    status: 'error';
    signature: string;
    error: string;
} | {
    status: 'missing';
    signature: string;
};
export declare class AiService {
    private readonly jobs;
    private readonly results;
    private readonly summaries;
    private readonly homefeed;
    private readonly running;
    constructor(jobs: Repository<AiJob>, results: Repository<LayerSummary>, summaries: LayerSummaryService, homefeed: HomefeedService);
    private kindOf;
    private savedResult;
    private findJob;
    private isLive;
    start(orgId: number, layerId: number, username: string, kindParam: string, body: SpaceBody): Promise<AiJobView>;
    status(orgId: number, layerId: number, username: string, kindParam: string, signature: unknown): Promise<AiJobView>;
    private run;
}
