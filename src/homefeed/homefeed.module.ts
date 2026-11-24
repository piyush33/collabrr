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
import { LayerSummary } from './layer-summary.entity';
import { LayerSummaryService } from './layer-summary.service';
import { LayerSummaryController } from './layer-summary.controller';
import { AiJob } from './ai/ai-job.entity';
import { AiService } from './ai/ai.service';
import { AiController } from './ai/ai.controller';
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
      LayerSummary,
      AiJob,
    ]),
    NotificationModule,
    // If you have an OrganizationModule that exports TypeOrmModule.forFeature([...]),
    // you could import it here instead, but you must ensure OrganizationMember is exported.
    // OrganizationModule,
  ],
  controllers: [HomefeedController, LayerSummaryController, AiController],
  providers: [HomefeedService, LayerSummaryService, AiService],
  exports: [HomefeedService],
})
export class HomefeedModule {}
