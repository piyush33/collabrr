import { Repository } from 'typeorm';
import { Actor } from './actor.entity';
export declare class ActorService {
    private readonly actorRepository;
    constructor(actorRepository: Repository<Actor>);
    findByUsername(username: string): Promise<Actor>;
    findById(id: number): Promise<Actor | null>;
    createActor(data: Partial<Actor>): Promise<Actor>;
    updateActor(id: number, updateData: Partial<Actor>): Promise<Actor>;
    getFollowers(actorId: number): Promise<Actor[]>;
    getFollowing(actorId: number): Promise<Actor[]>;
    follow(actorId: number, targetActorId: number): Promise<any>;
    acceptFollowRequest(actorId: number, followerId: number): Promise<any>;
}
