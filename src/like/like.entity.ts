import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity()
@Unique(['user', 'homefeedItem'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileUser, (user) => user.likes, { onDelete: 'CASCADE' })
  user: ProfileUser;

  @ManyToOne(() => ProfileFeedItem, (feedItem) => feedItem.likes, {
    cascade: true,
  })
  feedItem: ProfileFeedItem;

  @ManyToOne(() => Homefeed, (homefeed) => homefeed.likes, {
    onDelete: 'CASCADE',
  })
  homefeedItem: Homefeed;
}
