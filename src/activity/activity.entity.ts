import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Actor } from '../actor/actor.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string; // Activity type: Like, Follow, Announce (repost), etc.

    @Column({ type: 'jsonb', nullable: true })
    object: any; // The object the activity is referring to (e.g., a post)

    @Column({ type: 'jsonb', nullable: true })
    target: any;

    @ManyToOne(() => Actor, (actor) => actor.activities)
    actor: Actor;

    @ManyToOne(() => Homefeed, (homefeed) => homefeed.activities)
    homeFeed: Homefeed;

    @Column()
    published: Date;
}
