import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileFeedService } from './profilefeed.service';
import { ProfileFeedController } from './profilefeed.controller';
import { ProfileFeedItem } from './profilefeed-item.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Organization } from 'src/organization/organization.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileFeedItem,
      ProfileUser,
      Organization,
      OrganizationMember,
      LinkedCardLayer,
      LayerMember,
    ]),
  ],
  providers: [ProfileFeedService],
  controllers: [ProfileFeedController],
})
export class ProfileFeedModule {}
