import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { Actor } from '../actor/actor.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Actor])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule { }
