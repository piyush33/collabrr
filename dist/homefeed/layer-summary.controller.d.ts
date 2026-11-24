import { LayerSummaryService } from './layer-summary.service';
export declare class LayerSummaryController {
    private readonly summaries;
    constructor(summaries: LayerSummaryService);
    private username;
    get(orgId: number, layerId: number, signature: string, req: any): Promise<{
        summary: Record<string, unknown>;
        savedAt: Date;
    }>;
    save(orgId: number, layerId: number, body: {
        signature?: unknown;
        model?: unknown;
        summary?: unknown;
    }, req: any): Promise<{
        ok: boolean;
    }>;
}
