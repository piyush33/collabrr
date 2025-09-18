// organization-member.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

export enum OrgRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

@Entity()
@Unique(['organization', 'user'])
export class OrganizationMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Organization, (o) => o.members, { eager: true })
  organization: Organization;

  @Index()
  @ManyToOne(() => ProfileUser, (u) => u.orgMemberships, { eager: true })
  user: ProfileUser;

  @Column({ type: 'enum', enum: OrgRole, default: OrgRole.MEMBER })
  role: OrgRole;

  @Column({ default: true })
  isActive: boolean;
}
