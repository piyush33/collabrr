// invitation.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

export enum InviteScope {
  ORG = 'org',
  LAYER = 'layer',
}
export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: InviteScope })
  scope: InviteScope;

  @Index()
  @ManyToOne(() => Organization, { nullable: true, eager: true })
  organization?: Organization;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { nullable: true, eager: true })
  layer?: LinkedCardLayer;

  @Column()
  email: string;

  @ManyToOne(() => ProfileUser, { nullable: true })
  invitedBy?: ProfileUser;

  @Index({ unique: true })
  @Column()
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;
}
