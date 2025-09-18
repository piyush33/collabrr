import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.entity';
import { Organization } from 'src/organization/organization.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { Resend } from 'resend';

@Module({
  imports: [
    ConfigModule, // already global, but fine to import
    TypeOrmModule.forFeature([
      Invitation,
      Organization,
      OrganizationMember,
      LinkedCardLayer,
      LayerMember,
      ProfileUser,
    ]),
  ],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    {
      provide: 'RESEND_CLIENT',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const key = cfg.get<string>('RESEND_API_KEY');
        return key ? new Resend(key) : null; // no-op in dev if missing
      },
    },
  ],
  exports: [InvitationService],
})
export class InvitationModule {}
