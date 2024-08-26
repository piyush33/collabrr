import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Reply } from './reply.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    image: string;

    @Column()
    comment: string;

    @ManyToOne(() => Homefeed, (homefeed) => homefeed.comments)
    homefeedItem: Homefeed;

    @OneToMany(() => Reply, (reply) => reply.comment, { cascade: true })
    replies: Reply[];
}
