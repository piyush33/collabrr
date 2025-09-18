import { Module } from '@nestjs/common';
import { RepostService } from './repost.service';
import { RepostController } from './repost.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';
import { Repost } from './repost.entity';
import { Notification } from 'src/notification/notification.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Repost,
      ProfileUser,
      ProfileFeedItem,
      Homefeed,
      Notification,
    ]),
    NotificationModule,
  ],
  providers: [RepostService],
  controllers: [RepostController],
})
export class RepostModule {}
