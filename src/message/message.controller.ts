// message.controller.ts
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity';

@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Post(':sender/:recipient')
    async sendMessage(
        @Param('sender') senderUsername: string,
        @Param('recipient') recipientUsername: string,
        @Body('content') content: string,
    ): Promise<Message> {
        return this.messageService.sendMessage(senderUsername, recipientUsername, content);
    }

    @Get('conversation/:user1/:user2')
    async getConversationHistory(
        @Param('user1') user1Username: string,
        @Param('user2') user2Username: string,
    ): Promise<Message[]> {
        return this.messageService.getConversationHistory(user1Username, user2Username);
    }

    @Get('recent/:username')
    async getRecentConversations(@Param('username') username: string) {
        return this.messageService.getRecentConversations(username);
    }
}
