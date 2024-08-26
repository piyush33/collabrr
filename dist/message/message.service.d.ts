import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';
export declare class MessageService {
    private messageRepository;
    private userRepository;
    private conversationRepository;
    constructor(messageRepository: Repository<Message>, userRepository: Repository<ProfileUser>, conversationRepository: Repository<Conversation>);
    sendMessage(senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getConversationHistory(user1Username: string, user2Username: string): Promise<Message[]>;
    getRecentConversations(username: string): Promise<Conversation[]>;
}
