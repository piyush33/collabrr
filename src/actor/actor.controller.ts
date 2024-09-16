import { Controller, Get, Param, Post, Body, NotFoundException, Query, Patch, Header } from '@nestjs/common';
import { ActorService } from './actor.service';
import { Actor } from './actor.entity';


@Controller('actors')
export class ActorController {
    constructor(private readonly actorService: ActorService) { }

    /**
     * Fetch the public profile of an Actor, responding in an ActivityPub-compliant format.
     * This is necessary for federation with other ActivityPub-compliant systems.
     */
    @Get(':username')
    @Header('Content-Type', 'application/ld+json ; profile="https://www.w3.org/ns/activitystreams"')
    async getActor(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Return a properly formatted ActivityPub Actor object
        return {
            '@context': [
                "https://www.w3.org/ns/activitystreams",
                {
                    "PublicKey": "https://w3id.org/security#PublicKey"
                }
            ],
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            type: 'Person',
            preferredUsername: actor.preferredUsername,
            name: actor.name,
            inbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/inbox`,
            outbox: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/outbox`,
            liked: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/liked`,
            followers: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/followers`,
            following: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/following`,
            publicKey: {
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}#main-key`,
                owner: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                publicKeyPem: actor.publicKey
            },
            summary: actor.summary || 'This is a random summary',
            icon: [
                "https://opinionthbucket.s3.eu-north-1.amazonaws.com/profile-images/a941beff-7577-42e7-98d3-5f6289d51590-12371158_1164591293570960_1294003296995843062_o.jpg"
            ]
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


    @Get(':username/followers')
    async getFollowers(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Fetch followers from your data model and return them in ActivityPub format
        const followers = await this.actorService.getFollowers(actor.id);  // Assuming this method fetches the followers

        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/followers`,
            type: 'OrderedCollection',
            totalItems: followers.length,
            orderedItems: followers.map(follower => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${follower.preferredUsername}`,
                type: 'Person',
            })),
        };
    }

    @Get(':username/following')
    async getFollowing(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Fetch following users from your data model and return them in ActivityPub format
        const following = await this.actorService.getFollowing(actor.id);  // Assuming this method fetches the following users

        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}/following`,
            type: 'OrderedCollection',
            totalItems: following.length,
            orderedItems: following.map(followingUser => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${followingUser.preferredUsername}`,
                type: 'Person',
            })),
        };
    }
    /**
     * Initiate a follow request for an Actor.
     */
    @Post(':actorId/follow')
    async followActor(
        @Param('actorId') actorId: number,
        @Body() { targetActorId }: { targetActorId: number },
    ) {
        const actor = await this.actorService.findById(actorId);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Follow the target actor using the ActorService
        return this.actorService.follow(actorId, targetActorId);
    }

    /**
     * Handle a POST request to accept a follow (optional).
     * In the Fediverse, accepting follows typically requires explicit acknowledgment.
     */
    @Post(':actorId/acceptFollow')
    async acceptFollowRequest(
        @Param('actorId') actorId: number,
        @Body() { followerId }: { followerId: number },
    ) {
        return this.actorService.acceptFollowRequest(actorId, followerId);
    }

    @Get('liked')
    async getLiked(@Param('username') username: string) {
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Return an empty OrderedCollection initially for Liked objects
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'OrderedCollection',
            totalItems: 0,
            orderedItems: [],
        };
    }

}
