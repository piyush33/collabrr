import { Repository } from 'typeorm';
import { LayerSummary } from './layer-summary.entity';
import { HomefeedService } from './homefeed.service';
export declare class LayerSummaryService {
    private readonly repo;
    private readonly homefeedService;
    constructor(repo: Repository<LayerSummary>, homefeedService: HomefeedService);
    private assertSignature;
    get(orgId: number, layerId: number, username: string, signature: unknown): Promise<{
        summary: Record<string, unknown>;
        savedAt: Date;
    }>;
    save(orgId: number, layerId: number, username: string, body: {
        signature?: unknown;
        model?: unknown;
        summary?: unknown;
    }): Promise<{
        ok: boolean;
    }>;
}
