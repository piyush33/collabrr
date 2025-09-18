// conversation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Message } from './message.entity';
import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  // Either organization OR layer is set (service enforces)
  @Index()
  @ManyToOne(() => Organization, { nullable: true, eager: true })
  organization?: Organization;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { nullable: true, eager: true })
  layer?: LinkedCardLayer;

  @ManyToOne(() => ProfileUser, (u) => u.conversationsAsUser1, { eager: true })
  user1: ProfileUser;

  @ManyToOne(() => ProfileUser, (u) => u.conversationsAsUser2, { eager: true })
  user2: ProfileUser;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt?: Date;
}
