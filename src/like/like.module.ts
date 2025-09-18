import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Notification } from 'src/notification/notification.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Like,
      ProfileUser,
      ProfileFeedItem,
      Homefeed,
      Notification,
    ]),
    NotificationModule,
  ],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
