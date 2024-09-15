import { ActorService } from './actor.service';
import { Actor } from './actor.entity';
export declare class ActorController {
    private readonly actorService;
    constructor(actorService: ActorService);
    getActor(username: string): Promise<{
        '@context': string;
        id: string;
        type: string;
        preferredUsername: string;
        name: string;
        inbox: string;
        outbox: string;
        liked: string;
        followers: string;
        following: string;
        publicKey: {
            id: string;
            owner: string;
            publicKeyPem: string;
        };
        summary: string;
        icon: string[];
    }>;
    createActor(actorData: Partial<Actor>): Promise<Actor>;
    updateActor(id: number, updateData: Partial<Actor>): Promise<Actor>;
    getFollowers(username: string): Promise<{
        '@context': string;
        id: string;
        type: string;
        totalItems: number;
        orderedItems: {
            id: string;
            type: string;
        }[];
    }>;
    getFollowing(username: string): Promise<{
        '@context': string;
        id: string;
        type: string;
        totalItems: number;
        orderedItems: {
            id: string;
            type: string;
        }[];
    }>;
    followActor(actorId: number, { targetActorId }: {
        targetActorId: number;
    }): Promise<any>;
    acceptFollowRequest(actorId: number, { followerId }: {
        followerId: number;
    }): Promise<any>;
    getLiked(username: string): Promise<{
        '@context': string;
        type: string;
        totalItems: number;
        orderedItems: any[];
    }>;
}
