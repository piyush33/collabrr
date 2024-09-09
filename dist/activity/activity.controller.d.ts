import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    createActivity(actorId: number, { type, object }: {
        type: string;
        object: any;
    }): Promise<import("./activity.entity").Activity>;
    getActivities(actorId: number): Promise<import("./activity.entity").Activity[]>;
}
