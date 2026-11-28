import { Repository } from 'typeorm';
import { HomefeedService } from '../homefeed.service';
import { ThinkTask } from './think.entities';
import { ConvergeService } from './converge.service';
export declare class ThinkService {
    private readonly tasks;
    private readonly homefeed;
    private readonly convergeState;
    constructor(tasks: Repository<ThinkTask>, homefeed: HomefeedService, convergeState: ConvergeService);
    start(orgId: number, username: string, kindIn: string, body: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        status: "pending";
    }>;
    private run;
    get(orgId: number, username: string, id: string): Promise<{
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
}
