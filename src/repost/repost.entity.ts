import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity()
@Unique(['user', 'homefeedItem'])
export class Repost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProfileUser, (user) => user.reposts)
  user: ProfileUser;

  @ManyToOne(() => ProfileFeedItem, (feedItem) => feedItem.reposts)
  feedItem: ProfileFeedItem;

  @ManyToOne(() => Homefeed, (homefeedItem) => homefeedItem.reposts, {
    onDelete: 'CASCADE',
  })
  homefeedItem: Homefeed;
}
