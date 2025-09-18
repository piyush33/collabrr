// team-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Column,
  Index,
} from 'typeorm';
import { Team } from './team.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity()
@Unique(['team', 'user'])
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Team, (t) => t.members, { eager: true })
  team: Team;

  @Index()
  @ManyToOne(() => ProfileUser, { eager: true })
  user: ProfileUser;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.MEMBER })
  role: TeamRole;

  @Column({ default: true })
  isActive: boolean;
}
