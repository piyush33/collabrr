// src/homefeed/linked-card-layer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Organization } from 'src/organization/organization.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { Homefeed } from './homefeed.entity';
import { LayerMember } from './layer-member.entity'; // if you already have one

@Entity()
@Unique(['organization', 'key'])
export class LinkedCardLayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Organization, (o) => o.layers, {
    eager: true,
    nullable: false,
  })
  organization: Organization;

  @ManyToOne(() => ProfileUser, { eager: true, nullable: true })
  createdBy?: ProfileUser;

  // stable identifier (what your UI can keep using)
  @Index()
  @Column()
  key: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Homefeed, (c) => c.layer)
  cards: Homefeed[];

  @Column({ default: false })
  isLocked: boolean;

  @OneToMany(() => LayerMember, (m) => m.layer)
  members: LayerMember[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
