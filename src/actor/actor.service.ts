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
        return await this.actorRepository.findOne({ where: { id }, relations: ['followers', 'following'] });
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

    async getFollowers(actorId: number): Promise<Actor[]> {
        const actor = await this.actorRepository.findOne({
            where: { id: actorId },
            relations: ['followers'],
        });

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        return actor.followers;
    }

    async getFollowing(actorId: number): Promise<Actor[]> {
        const actor = await this.actorRepository.findOne({
            where: { id: actorId },
            relations: ['following'],
        });

        if (!actor) {
            throw new NotFoundException('Actor not found');
        }

        return actor.following;
    }

    async follow(actorId: number, targetActorId: number): Promise<any> {
        const actor = await this.findById(actorId);
        const targetActor = await this.findById(targetActorId);

        if (!actor || !targetActor) {
            throw new NotFoundException('Actor or target actor not found');
        }

        // Add target actor to the following list
        actor.following.push(targetActor);

        // Save the updated actor entity
        await this.actorRepository.save(actor);

        // Create a Follow activity
        const followActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Follow',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${targetActor.preferredUsername}`,
        };

        // Send the follow activity to the target actor's inbox
        const targetActorInbox = `${targetActor.inbox}/inbox`;

        const response = await fetch(targetActorInbox, {
            method: 'POST',
            body: JSON.stringify(followActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to send follow activity: ${response.statusText}`);
        }

        return { status: 'Follow request sent', target: targetActor.preferredUsername };
    }

    async acceptFollowRequest(actorId: number, followerId: number): Promise<any> {
        const actor = await this.findById(actorId);
        const follower = await this.findById(followerId);

        if (!actor || !follower) {
            throw new NotFoundException('Actor or follower not found');
        }

        // Respond with an Accept activity
        const acceptActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Accept',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            object: {
                type: 'Follow',
                actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${follower.preferredUsername}`,
                object: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
            },
        };

        const followerInbox = `${follower.inbox}/inbox`;

        const response = await fetch(followerInbox, {
            method: 'POST',
            body: JSON.stringify(acceptActivity),
            headers: { 'Content-Type': 'application/ld+json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to send accept activity: ${response.statusText}`);
        }

        // Optionally, add the follower to the followers list
        actor.followers.push(follower);
        await this.actorRepository.save(actor);

        return { status: 'Follow request accepted', follower: follower.preferredUsername };
    }
}
