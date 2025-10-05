import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Organization } from 'src/organization/organization.entity';
import { Team } from 'src/organization/team.entity';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';

enum Visibility {
  ORG = 'org',
  LAYER = 'layer',
  PRIVATE = 'private',
  TEAM = 'team',
}
@Entity()
export class ProfileFeedItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  layerKey: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  weblink: string;

  @Column({ nullable: true })
  lock: boolean;

  @Column({ nullable: true })
  privacy: boolean;

  @Column({ type: 'enum', enum: Visibility, default: Visibility.ORG })
  visibility: Visibility;

  @ManyToOne(() => Team, { nullable: true, eager: true })
  team?: Team;

  @ManyToOne(() => Organization, (o) => o.profilePosts, { eager: true })
  organization: Organization;

  @ManyToOne(() => ProfileUser, (user) => user.created)
  userCreated: ProfileUser;

  @ManyToOne(() => ProfileUser, (user) => user.reposted)
  userReposted: ProfileUser;

  @ManyToOne(() => ProfileUser, (user) => user.liked)
  userLiked: ProfileUser;

  @ManyToOne(() => ProfileUser, (user) => user.saved)
  userSaved: ProfileUser;

  @OneToMany(() => Like, (like) => like.feedItem)
  likes: Like[];

  @OneToMany(() => Repost, (repost) => repost.feedItem)
  reposts: Repost[];

  @OneToMany(() => Save, (save) => save.feedItem)
  saves: Save[];

  @OneToOne(() => Homefeed, (h) => h.profileFeedItem, {
    nullable: true,
    onDelete: 'SET NULL', // or 'CASCADE' if you want to remove profile post when homefeed card is deleted
    eager: false,
  })
  @JoinColumn({ name: 'homefeedItemId' }) // creates FK column "homefeedItemId"
  homefeedItem?: Homefeed;

  @Index('idx_profilefeed_phase')
  @Column({
    type: 'enum',
    enum: Phase,
    enumName: 'phase_enum', // reuse same DB enum
    nullable: true,
  })
  phase?: Phase | null;

  @Column({
    type: 'enum',
    enum: RoleType,
    enumName: 'role_type_enum', // reuse same DB enum
    array: true,
    default: '{}',
  })
  roleTypes!: RoleType[];
}
