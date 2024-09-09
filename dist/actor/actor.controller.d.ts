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
        followers: string;
        following: string;
        publicKey: {
            id: string;
            owner: string;
            publicKeyPem: string;
        };
        summary: string;
    }>;
    createActor(actorData: Partial<Actor>): Promise<Actor>;
    updateActor(id: number, updateData: Partial<Actor>): Promise<Actor>;
    followActor(actorId: number, { targetActor }: {
        targetActor: string;
    }): Promise<any>;
    acceptFollowRequest(actorId: number, { follower }: {
        follower: string;
    }): Promise<any>;
}
