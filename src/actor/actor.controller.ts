import { Controller, Get, Param, Post, Body, NotFoundException, Query, Patch } from '@nestjs/common';
import { ActorService } from './actor.service';
import { Actor } from './actor.entity';

@Controller('.well-known')
export class WebFingerController {
    constructor(private readonly actorService: ActorService) { }

    @Get('webfinger')
    async handleWebFinger(@Query('resource') resource: string) {
        if (!resource) {
            throw new Error('No resource provided');
        }

        const match = resource.match(/^acct:(.+)@opinionth.com$/);
        if (!match) {
            throw new Error('Invalid WebFinger resource');
        }

        const username = match[1];
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new Error('Actor not found');
        }

        return {
            subject: `acct:${actor.preferredUsername}@opinionth.com`,
            links: [
                {
                    rel: 'self',
                    type: 'application/activity+json',
                    href: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                },
            ],
        };
    }
}

@Controller('actors')
export class ActorController {
    constructor(private readonly actorService: ActorService) { }

    /**
     * Fetch the public profile of an Actor, responding in an ActivityPub-compliant format.
     * This is necessary for federation with other ActivityPub-compliant systems.
     */
    @Get(':username')
    async getActor(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Return a properly formatted ActivityPub Actor object
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            type: 'Person',
            preferredUsername: actor.preferredUsername,
            name: actor.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/outbox`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/following`,
            publicKey: {
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}#main-key`,
                owner: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                publicKeyPem: actor.publicKey
            },
            summary: actor.summary || '',
        };
    }

    /**
     * Create a new Actor.
     */
    @Post()
    async createActor(@Body() actorData: Partial<Actor>) {
        return this.actorService.createActor(actorData);
    }

    @Patch(':id')
    async updateActor(@Param('id') id: number, @Body() updateData: Partial<Actor>) {
        return this.actorService.updateActor(id, updateData);
    }

    /**
     * Initiate a follow request for an Actor.
     */
    @Post(':actorId/follow')
    async followActor(
        @Param('actorId') actorId: number,
        @Body() { targetActor }: { targetActor: string },
    ) {
        const actor = await this.actorService.findById(actorId);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Follow the target actor using the ActorService
        return this.actorService.follow(actorId, targetActor);
    }

    /**
     * Handle a POST request to accept a follow (optional).
     * In the Fediverse, accepting follows typically requires explicit acknowledgment.
     */
    @Post(':actorId/acceptFollow')
    async acceptFollowRequest(
        @Param('actorId') actorId: number,
        @Body() { follower }: { follower: string },
    ) {
        return this.actorService.acceptFollowRequest(actorId, follower);
    }
}
