import { ActivityService } from '../activity/activity.service';
import { ActorService } from './actor.service';
export declare class InboxController {
    private readonly activityService;
    private readonly actorService;
    constructor(activityService: ActivityService, actorService: ActorService);
    receiveActivity(username: string, activity: any): Promise<import("../activity/activity.entity").Activity>;
    sendActivities(username: string): Promise<{
        '@context': string;
        type: string;
        totalItems: number;
        orderedItems: {
            id: string;
            type: string;
            actor: string;
            object: any;
        }[];
    }>;
}
