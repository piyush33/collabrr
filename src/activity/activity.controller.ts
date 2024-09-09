import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activities')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Post(':actorId')
    async createActivity(
        @Param('actorId') actorId: number,
        @Body() { type, object }: { type: string; object: any },
    ) {
        return this.activityService.createActivity(type, actorId, object);
    }

    @Get(':actorId')
    async getActivities(@Param('actorId') actorId: number) {
        return this.activityService.getActivity(actorId);
    }
}
