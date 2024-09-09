import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actor } from './actor.entity';

@Injectable()
export class ActorService {
    constructor(
        @InjectRepository(Actor)
        private readonly actorRepository: Repository<Actor>,
    ) { }

    async findByUsername(username: string): Promise<Actor> {
        return this.actorRepository.findOne({ where: { preferredUsername: username } });
    }

    async findById(id: number): Promise<Actor | null> {
        return await this.actorRepository.findOne({ where: { id } });
    }

    async createActor(data: Partial<Actor>): Promise<Actor> {
        const actor = this.actorRepository.create(data);
        return this.actorRepository.save(actor);
    }

    async updateActor(id: number, updateData: Partial<Actor>): Promise<Actor> {
        const actor = await this.findById(id);
        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        Object.assign(actor, updateData); // Merge new data into the actor object
        return this.actorRepository.save(actor); // Save the updated actor entity
    }

    async follow(actorId: number, targetActorUrl: string): Promise<any> {
        const actor = await this.findById(actorId);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        const followActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Follow',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: targetActorUrl,
        };

        // Send the follow activity to the target actor's inbox
        const targetActorInbox = `${targetActorUrl}/inbox`;

        const response = await fetch(targetActorInbox, {
            method: 'POST',
            body: JSON.stringify(followActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to send follow activity: ${response.statusText}`);
        }

        actor.following += `, ${targetActorUrl}`;
        this.actorRepository.save(actor);

        return { status: 'Follow request sent', target: targetActorUrl };
    }

    async acceptFollowRequest(actorId: number, followerUrl: string): Promise<any> {
        const actor = await this.findById(actorId);

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        // Respond with an Accept activity
        const acceptActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Accept',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: {
                type: 'Follow',
                actor: followerUrl,
                object: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            },
        };

        const followerInbox = `${followerUrl}/inbox`;

        const response = await fetch(followerInbox, {
            method: 'POST',
            body: JSON.stringify(acceptActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to send accept activity: ${response.statusText}`);
        }

        return { status: 'Follow request accepted', follower: followerUrl };
    }


}
