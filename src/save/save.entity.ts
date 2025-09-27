import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Organization } from 'src/organization/organization.entity';

@Entity()
@Unique(['user', 'homefeedItem'])
export class Save {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileUser, (user) => user.saves)
  user: ProfileUser;

  @ManyToOne(() => ProfileFeedItem, (feedItem) => feedItem.saves)
  feedItem: ProfileFeedItem;

  @ManyToOne(() => Homefeed, (homefeedItem) => homefeedItem.saves, {
    onDelete: 'CASCADE',
  })
  homefeedItem: Homefeed;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;
}
