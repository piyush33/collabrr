import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homefeed } from './homefeed.entity';
import { HomefeedService } from './homefeed.service';
import { HomefeedController } from './homefeed.controller';
import { UserInteraction } from './user-interaction.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Homefeed, UserInteraction, ProfileUser])],
  providers: [HomefeedService],
  controllers: [HomefeedController],
})
export class HomefeedModule { }
