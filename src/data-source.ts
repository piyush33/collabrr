import { DataSource } from 'typeorm';
import { ProfileUser } from './profileusers/profileuser.entity';
import { ProfileFeedItem } from './profilefeed/profilefeed-item.entity';
import { Like } from './like/like.entity';
import { Repost } from './repost/repost.entity';
import { Save } from './save/save.entity';
import { Homefeed } from './homefeed/homefeed.entity';
import { Follower, Following } from './profileusers/follower.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "mydatabase",
  entities: [ProfileUser, ProfileFeedItem, Like, Repost, Save, Homefeed, Follower, Following],
  migrations: ['src/migration/*.ts'],
  synchronize: true, // Disable synchronize in production
});
