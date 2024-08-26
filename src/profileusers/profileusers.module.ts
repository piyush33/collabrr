import { Module } from '@nestjs/common';
import { ProfileusersService } from './profileusers.service';
import { ProfileusersController } from './profileusers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from './profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Follower } from './follower.entity';
import { Following } from './follower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUser, ProfileFeedItem, Follower, Following])],
  providers: [ProfileusersService],
  controllers: [ProfileusersController]
})
export class ProfileusersModule { }
