import { MessageService } from './message.service';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    sendOrgMessage(orgId: number, senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getOrgConversationHistory(orgId: number, user1Username: string, user2Username: string): Promise<Message[]>;
    getOrgRecentConversations(orgId: number, username: string): Promise<Conversation[]>;
    sendLayerMessage(layerId: number, senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getLayerConversationHistory(layerId: number, user1Username: string, user2Username: string): Promise<Message[]>;
    getLayerRecentConversations(layerId: number, username: string): Promise<Conversation[]>;
}
