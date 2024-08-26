// message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, ProfileUser, Conversation])],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule { }
