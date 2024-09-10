import { Activity } from '../activity/activity.entity';
export declare class Actor {
    id: number;
    preferredUsername: string;
    name: string;
    inbox: string;
    outbox: string;
    publicKey: string;
    privateKey: string;
    activities: Activity[];
    summary?: string;
    followers: Actor[];
    following: Actor[];
    get inboxUrl(): string;
    get outboxUrl(): string;
    get followersUrl(): string;
    get followingUrl(): string;
}
