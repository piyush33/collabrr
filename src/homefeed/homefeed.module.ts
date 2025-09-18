// src/homefeed/homefeed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Homefeed } from './homefeed.entity';
import { UserInteraction } from './user-interaction.entity';
import { HomefeedService } from './homefeed.service';
import { HomefeedController } from './homefeed.controller';

import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { Organization } from 'src/organization/organization.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { Team } from 'src/organization/team.entity';
import { TeamMember } from 'src/organization/team-member.entity';
import { TeamCardAccess } from 'src/organization/team-card-access.entity';
import { LinkedCardLayer } from './linked-card-layer.entity';
import { LayerMember } from './layer-member.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Homefeed,
      UserInteraction,
      ProfileUser,
      Organization,
      OrganizationMember,
      Team,
      TeamMember,
      TeamCardAccess,
      LinkedCardLayer,
      LayerMember,
    ]),
    NotificationModule,
    // If you have an OrganizationModule that exports TypeOrmModule.forFeature([...]),
    // you could import it here instead, but you must ensure OrganizationMember is exported.
    // OrganizationModule,
  ],
  controllers: [HomefeedController],
  providers: [HomefeedService],
  exports: [HomefeedService],
})
export class HomefeedModule {}
