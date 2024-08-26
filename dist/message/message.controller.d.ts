import { MessageService } from './message.service';
import { Message } from './message.entity';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    sendMessage(senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getConversationHistory(user1Username: string, user2Username: string): Promise<Message[]>;
    getRecentConversations(username: string): Promise<import("./conversation.entity").Conversation[]>;
}
