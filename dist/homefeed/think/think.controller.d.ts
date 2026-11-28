import { HomefeedService } from '../homefeed.service';
import { ThinkService } from './think.service';
import { ConvergeService } from './converge.service';
export declare class ThinkController {
    private readonly think;
    private readonly converge;
    private readonly homefeed;
    constructor(think: ThinkService, converge: ConvergeService, homefeed: HomefeedService);
    private username;
    start(orgId: number, kind: string, body: any, req: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        status: "pending";
    }>;
    task(orgId: number, id: string, req: any): Promise<{
        id: string;
        status: string;
        error: string;
        result?: undefined;
    } | {
        id: string;
        status: import("./think.entities").ThinkTaskStatus;
        result: Record<string, unknown>;
        error: string;
    }>;
    state(orgId: number, layerId: number, req: any): Promise<import("./converge.service").ConvergeState>;
    vote(orgId: number, layerId: number, body: {
        pointId?: string;
        position?: number | null;
    }, req: any): Promise<import("./converge.service").ConvergeState>;
    timer(orgId: number, layerId: number, body: {
        pointId?: string;
        op?: string;
        durationMs?: number;
    }, req: any): Promise<import("./converge.service").ConvergeState>;
}
