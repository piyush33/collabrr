import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';

@Entity()
@Unique(['user', 'homefeedItem'])
export class Save {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProfileUser, (user) => user.saves)
    user: ProfileUser;

    @ManyToOne(() => ProfileFeedItem, (feedItem) => feedItem.saves)
    feedItem: ProfileFeedItem;

    @ManyToOne(() => Homefeed, (homefeedItem) => homefeedItem.saves)
    homefeedItem: Homefeed;
}
