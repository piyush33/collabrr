import { IdeasBody, SpaceIdeasService } from './space-ideas.service';
export declare class SpaceIdeasController {
    private readonly ideas;
    constructor(ideas: SpaceIdeasService);
    private username;
    start(orgId: number, body: IdeasBody, req: any): Promise<import("./ai.service").AiJobView>;
    status(orgId: number, category: string, signature: string, req: any): Promise<import("./ai.service").AiJobView>;
}
