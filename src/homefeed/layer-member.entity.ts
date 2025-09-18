// src/homefeed/layer-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  Index,
} from 'typeorm';
import { LinkedCardLayer } from './linked-card-layer.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

export enum LayerRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

@Entity()
@Unique(['layer', 'user'])
export class LayerMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => LinkedCardLayer, (l) => l.members, { onDelete: 'CASCADE' })
  layer: LinkedCardLayer;

  @Index()
  @ManyToOne(() => ProfileUser, (u) => u.layerMemberships, {
    onDelete: 'CASCADE',
  })
  user: ProfileUser;

  @Column({ type: 'enum', enum: LayerRole, default: LayerRole.MEMBER })
  role: LayerRole;

  @Column({ default: true })
  isActive: boolean;
}
