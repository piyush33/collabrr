import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Actor } from '../actor/actor.entity';
export declare class ActivityService {
    private readonly activityRepository;
    private readonly actorRepository;
    constructor(activityRepository: Repository<Activity>, actorRepository: Repository<Actor>);
    createActivity(type: string, actorId: number, object: any): Promise<Activity>;
    getActivity(actorId: number): Promise<Activity[]>;
    getActivitiesForActor(actorId: number): Promise<Activity[]>;
}
