import { AiService } from './ai.service';
import type { SpaceBody } from './ai-prompts';
export declare class AiController {
    private readonly ai;
    constructor(ai: AiService);
    private username;
    start(orgId: number, layerId: number, kind: string, body: SpaceBody, req: any): Promise<import("./ai.service").AiJobView>;
    status(orgId: number, layerId: number, kind: string, signature: string, req: any): Promise<import("./ai.service").AiJobView>;
}
