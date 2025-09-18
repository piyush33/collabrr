// team.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Organization } from 'src/organization/organization.entity';
import { TeamMember } from './team-member.entity';

@Entity()
@Index(['organization', 'name'], { unique: true })
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => TeamMember, (m) => m.team)
  members: TeamMember[];
}
