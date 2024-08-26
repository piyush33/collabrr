import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Reply {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    image: string;

    @Column()
    reply: string;

    @ManyToOne(() => Comment, (comment) => comment.replies)
    comment: Comment;
}
