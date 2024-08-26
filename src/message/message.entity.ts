// message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProfileUser, (user) => user.sentMessages, { onDelete: 'CASCADE' })
    sender: ProfileUser;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    conversation: Conversation;

    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}
