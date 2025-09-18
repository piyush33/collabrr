// message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      ProfileUser,
      Conversation,
      OrganizationMember,
      LayerMember,
    ]),
  ],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
