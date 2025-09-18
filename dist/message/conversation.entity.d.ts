import { ProfileUser } from '../profileusers/profileuser.entity';
import { Message } from './message.entity';
import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
export declare class Conversation {
    id: number;
    organization?: Organization;
    layer?: LinkedCardLayer;
    user1: ProfileUser;
    user2: ProfileUser;
    messages: Message[];
    createdAt: Date;
    lastMessageAt?: Date;
}
