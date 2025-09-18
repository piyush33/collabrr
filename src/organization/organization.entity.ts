// organization.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { OrganizationMember } from './organization-member.entity';
import { ProfileFeedItem } from 'src/profilefeed/profilefeed-item.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';

export enum JoinPolicy {
  INVITE_ONLY = 'invite_only',
  DOMAIN = 'domain',
  OPEN = 'open',
}

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  slug: string; // e.g., 'acme' (use for subdomain)

  @Column()
  name: string;

  @Column({ type: 'enum', enum: JoinPolicy, default: JoinPolicy.INVITE_ONLY })
  joinPolicy: JoinPolicy;

  // NEW: allowed email domains when joinPolicy=DOMAIN (e.g. ['khidki.homes'])
  @Column('text', { array: true, default: '{}' })
  allowedDomains: string[];

  @OneToMany(() => OrganizationMember, (m) => m.organization)
  members: OrganizationMember[];

  @OneToMany(() => Homefeed, (h) => h.organization)
  posts: Homefeed[];

  @OneToMany(() => ProfileFeedItem, (h) => h.organization)
  profilePosts: ProfileFeedItem[];

  @OneToMany(() => LinkedCardLayer, (l) => l.organization)
  layers: LinkedCardLayer[];
}
