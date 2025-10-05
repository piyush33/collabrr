import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Like } from '../like/like.entity';
import { Repost } from '../repost/repost.entity';
import { Save } from '../save/save.entity';
import { Comment } from '../comment/comment.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UserInteraction } from './user-interaction.entity';
import { Notification } from 'src/notification/notification.entity';
import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from './linked-card-layer.entity';
import { Team } from 'src/organization/team.entity';
import { ProfileFeedItem } from 'src/profilefeed/profilefeed-item.entity';
import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';

export enum Visibility {
  ORG = 'org',
  LAYER = 'layer',
  PRIVATE = 'private',
  TEAM = 'team',
}

@Entity()
export class Homefeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
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

  @ManyToOne(() => Team, { nullable: true, eager: false })
  team?: Team;

  @ManyToOne(() => Organization, (o) => o.posts, { eager: true })
  organization: Organization;

  @ManyToOne(() => LinkedCardLayer, (layer) => layer.cards, {
    nullable: true,
    eager: false,
  })
  layer?: LinkedCardLayer;

  @Column({ type: 'enum', enum: Visibility, default: Visibility.ORG })
  visibility: Visibility;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  weblink: string;

  @Column({ nullable: true })
  lock: boolean;

  @Column({ nullable: true })
  privacy: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Like, (like) => like.homefeedItem, { cascade: true })
  likes: Like[];

  @OneToMany(() => Repost, (repost) => repost.homefeedItem, { cascade: true })
  reposts: Repost[];

  @OneToMany(() => Save, (save) => save.homefeedItem, { cascade: true })
  saves: Save[];

  @OneToMany(() => Comment, (comment) => comment.homefeedItem, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => UserInteraction, (interaction) => interaction.homefeedItem, {
    cascade: true,
  })
  interactions: UserInteraction[];

  @ManyToOne(() => ProfileUser, (user) => user.createdPosts)
  createdBy: ProfileUser;

  @OneToMany(() => Notification, (notification) => notification.homefeedItem)
  notifications: Notification[];

  @OneToOne(() => ProfileFeedItem, (p) => p.homefeedItem, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profileFeedItemId' }) // FK column on Homefeed
  profileFeedItem?: ProfileFeedItem;

  @Column({ nullable: true })
  profileFeedItemId?: number;

  @Index('idx_homefeed_phase')
  @Column({
    type: 'enum',
    enum: Phase,
    enumName: 'phase_enum',
    nullable: true,
  })
  phase?: Phase | null;

  @Column({
    type: 'enum',
    enum: RoleType,
    enumName: 'role_type_enum',
    array: true,
    default: '{}',
  })
  roleTypes!: RoleType[];
}
