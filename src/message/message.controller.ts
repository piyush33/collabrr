// message.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';

// (Optionally) add @UseGuards(OrgGuard) on org routes and @UseGuards(LayerGuard) on layer routes.
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // -------- ORG DMs --------
  @Post('orgs/:orgId/messages/:sender/:recipient')
  sendOrgMessage(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('sender') senderUsername: string,
    @Param('recipient') recipientUsername: string,
    @Body('content') content: string,
  ): Promise<Message> {
    return this.messageService.sendOrgMessage(
      orgId,
      senderUsername,
      recipientUsername,
      content,
    );
  }

  @Get('orgs/:orgId/messages/conversation/:user1/:user2')
  getOrgConversationHistory(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('user1') user1Username: string,
    @Param('user2') user2Username: string,
  ): Promise<Message[]> {
    return this.messageService.getOrgConversationHistory(
      orgId,
      user1Username,
      user2Username,
    );
  }

  @Get('orgs/:orgId/messages/recent/:username')
  getOrgRecentConversations(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
  ): Promise<Conversation[]> {
    return this.messageService.getOrgRecentConversations(orgId, username);
  }

  // -------- LAYER DMs (guests allowed) --------
  @Post('layers/:layerId/messages/:sender/:recipient')
  sendLayerMessage(
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('sender') senderUsername: string,
    @Param('recipient') recipientUsername: string,
    @Body('content') content: string,
  ): Promise<Message> {
    return this.messageService.sendLayerMessage(
      layerId,
      senderUsername,
      recipientUsername,
      content,
    );
  }

  @Get('layers/:layerId/messages/conversation/:user1/:user2')
  getLayerConversationHistory(
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('user1') user1Username: string,
    @Param('user2') user2Username: string,
  ): Promise<Message[]> {
    return this.messageService.getLayerConversationHistory(
      layerId,
      user1Username,
      user2Username,
    );
  }

  @Get('layers/:layerId/messages/recent/:username')
  getLayerRecentConversations(
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('username') username: string,
  ): Promise<Conversation[]> {
    return this.messageService.getLayerRecentConversations(layerId, username);
  }
}
