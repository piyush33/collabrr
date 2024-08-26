// notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Homefeed } from 'src/homefeed/homefeed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, ProfileUser, Homefeed])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService], // Export for use in other modules
})
export class NotificationModule { }
