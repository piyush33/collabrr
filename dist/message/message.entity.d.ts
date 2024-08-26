import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';
export declare class Message {
    id: number;
    sender: ProfileUser;
    conversation: Conversation;
    content: string;
    createdAt: Date;
}
