import { ProfileUser } from '../profileusers/profileuser.entity';
import { Message } from './message.entity';
export declare class Conversation {
    id: number;
    user1: ProfileUser;
    user2: ProfileUser;
    messages: Message[];
    lastMessageAt: Date;
}
