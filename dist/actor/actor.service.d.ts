import { Repository } from 'typeorm';
import { Actor } from './actor.entity';
export declare class ActorService {
    private readonly actorRepository;
    constructor(actorRepository: Repository<Actor>);
    findByUsername(username: string): Promise<Actor>;
    findById(id: number): Promise<Actor | null>;
    createActor(data: Partial<Actor>): Promise<Actor>;
    updateActor(id: number, updateData: Partial<Actor>): Promise<Actor>;
    follow(actorId: number, targetActorUrl: string): Promise<any>;
    acceptFollowRequest(actorId: number, followerUrl: string): Promise<any>;
}
