// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { Homefeed } from 'src/homefeed/homefeed.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
import { Organization } from 'src/organization/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      ProfileUser,
      Homefeed,
      Organization,
      OrganizationMember,
      LayerMember,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
