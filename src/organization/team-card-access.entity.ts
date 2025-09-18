// team-card-access.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

@Entity()
@Unique(['homefeed', 'user'])
export class TeamCardAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Homefeed, { onDelete: 'CASCADE' })
  homefeed: Homefeed;

  @Index()
  @ManyToOne(() => ProfileUser, (u) => u.teamMemberships, { eager: true })
  user: ProfileUser;
}
