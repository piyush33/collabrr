import { Controller, Post, Param, Body, Get, NotFoundException } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { ActorService } from './actor.service'; // Import actor service to handle actor retrieval

@Controller('actors/:username')
export class InboxController {
    constructor(
        private readonly activityService: ActivityService,
        private readonly actorService: ActorService // Use actor service for looking up actors
    ) { }

    // POST endpoint for receiving federated activities (e.g., Follow, Like, Announce)
    @Post('inbox')
    async receiveActivity(@Param('username') username: string, @Body() activity: any) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Log the incoming activity for debugging
        console.log(`Received activity for ${username}:`, activity);

        // Handle activity, store in actor's inbox or process it
        const result = await this.activityService.createActivity(activity.type, actor.id, activity);

        // Respond with ActivityStreams "Accept" for follow request, or generic OK response
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Accept',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${username}`,
            object: activity,
            result: 'Activity processed successfully',
        };
    }

    // GET endpoint for serving actor's outbox (ActivityPub outbox)
    @Get('outbox')
    async sendActivities(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Get activities from the actor's outbox
        const activities = await this.activityService.getActivitiesForActor(actor.id);

        // Structure the response according to ActivityPub standards
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'OrderedCollection',
            totalItems: activities.length,
            orderedItems: activities.map((activity) => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/activities/${activity.id}`,
                type: activity.type,
                actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${username}`,
                object: activity.object,
            })),
        };
    }
}
