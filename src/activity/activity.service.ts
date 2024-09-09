import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Actor } from '../actor/actor.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        @InjectRepository(Actor)
        private readonly actorRepository: Repository<Actor>,
    ) { }

    async createActivity(type: string, actorId: number, object: any): Promise<Activity> {
        const actor = await this.actorRepository.findOne({ where: { id: actorId } });
        if (!actor) {
            throw new Error('Actor not found');
        }

        const activity = this.activityRepository.create({
            type,
            actor,
            object,
            published: new Date(),
        });

        return this.activityRepository.save(activity);
    }

    async getActivity(actorId: number): Promise<Activity[]> {
        return this.activityRepository.find({ where: { actor: { id: actorId } }, relations: ['actor'] });
    }

    async getActivitiesForActor(actorId: number): Promise<Activity[]> {
        return await this.activityRepository.find({
            where: { actor: { id: actorId } },
            order: { published: 'DESC' },
        });
    }
}
