import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { ProfileFeedItem } from '../profilefeed/profilefeed-item.entity';
import { Homefeed } from '../homefeed/homefeed.entity';;
import { SaveService } from './save.service';
import { SaveController } from './save.controller';
import { Save } from './save.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Save, ProfileUser, ProfileFeedItem, Homefeed]),
  ],
  providers: [SaveService],
  controllers: [SaveController]
})
export class SaveModule { }
