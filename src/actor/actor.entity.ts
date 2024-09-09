import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Activity } from '../activity/activity.entity';

@Entity('actors')
export class Actor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    preferredUsername: string;

    @Column()
    name: string;

    @Column()
    inbox: string; // URL to actor's inbox

    @Column()
    outbox: string; // URL to actor's outbox

    @Column({ nullable: true })
    followers: string; // URL to actor's followers

    @Column({ nullable: true })
    following: string; // URL to actor's following

    @Column()
    publicKey: string; // Public key for actor

    @Column({ nullable: true })
    privateKey: string; // Private key for signing activities

    @OneToMany(() => Activity, (activity) => activity.actor)
    activities: Activity[];

    @Column({ nullable: true })
    summary?: string;

    // Derived URLs based on the domain
    get inboxUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/inbox`;
    }

    get outboxUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/outbox`;
    }

    get followersUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/followers`;
    }

    get followingUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/following`;
    }
}
