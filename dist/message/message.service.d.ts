import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';
import { OrganizationMember } from 'src/organization/organization-member.entity';
import { LayerMember } from 'src/homefeed/layer-member.entity';
export declare class MessageService {
    private messageRepo;
    private userRepo;
    private convoRepo;
    private orgMemRepo;
    private layerMemRepo;
    constructor(messageRepo: Repository<Message>, userRepo: Repository<ProfileUser>, convoRepo: Repository<Conversation>, orgMemRepo: Repository<OrganizationMember>, layerMemRepo: Repository<LayerMember>);
    private getUser;
    private assertOrgMember;
    private assertLayerMember;
    private usersOrdered;
    sendOrgMessage(orgId: number, senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getOrgConversationHistory(orgId: number, user1Username: string, user2Username: string): Promise<Message[]>;
    getOrgRecentConversations(orgId: number, username: string): Promise<Conversation[]>;
    sendLayerMessage(layerId: number, senderUsername: string, recipientUsername: string, content: string): Promise<Message>;
    getLayerConversationHistory(layerId: number, user1Username: string, user2Username: string): Promise<Message[]>;
    getLayerRecentConversations(layerId: number, username: string): Promise<Conversation[]>;
}
