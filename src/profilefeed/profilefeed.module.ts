import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedController } from './profilefeed.controller';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileFeedItem, ProfileUser])],
  providers: [ProfileFeedService],
  controllers: [ProfileFeedController],
})
export class ProfileFeedModule { }
