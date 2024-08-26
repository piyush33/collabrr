// conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProfileUser, (user) => user.conversationsAsUser1, { onDelete: 'CASCADE' })
    user1: ProfileUser;

    @ManyToOne(() => ProfileUser, (user) => user.conversationsAsUser2, { onDelete: 'CASCADE' })
    user2: ProfileUser;

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastMessageAt: Date;
}
