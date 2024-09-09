import { Activity } from '../activity/activity.entity';
export declare class Actor {
    id: number;
    preferredUsername: string;
    name: string;
    inbox: string;
    outbox: string;
    followers: string;
    following: string;
    publicKey: string;
    privateKey: string;
    activities: Activity[];
    summary?: string;
    get inboxUrl(): string;
    get outboxUrl(): string;
    get followersUrl(): string;
    get followingUrl(): string;
}
