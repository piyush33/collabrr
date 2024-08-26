// message.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ProfileUser } from '../profileusers/profileuser.entity';
import { Conversation } from './conversation.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(ProfileUser)
        private userRepository: Repository<ProfileUser>,
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
    ) { }

    async sendMessage(senderUsername: string, recipientUsername: string, content: string): Promise<Message> {
        const sender = await this.userRepository.findOne({ where: { username: senderUsername } });
        const recipient = await this.userRepository.findOne({ where: { username: recipientUsername } });

        if (!sender || !recipient) {
            throw new NotFoundException('User not found');
        }

        let conversation = await this.conversationRepository.findOne({
            where: [
                { user1: sender, user2: recipient },
                { user1: recipient, user2: sender },
            ],
            relations: ['user1', 'user2'],
        });

        if (!conversation) {
            conversation = this.conversationRepository.create({
                user1: sender,
                user2: recipient,
            });
            await this.conversationRepository.save(conversation);
        }

        const message = this.messageRepository.create({
            sender,
            content,
            conversation,
        });

        conversation.lastMessageAt = new Date();
        await this.conversationRepository.save(conversation);

        return this.messageRepository.save(message);
    }

    async getConversationHistory(user1Username: string, user2Username: string): Promise<Message[]> {
        const user1 = await this.userRepository.findOne({ where: { username: user1Username } });
        const user2 = await this.userRepository.findOne({ where: { username: user2Username } });

        if (!user1 || !user2) {
            throw new NotFoundException('User not found');
        }

        const conversation = await this.conversationRepository.findOne({
            where: [
                { user1, user2 },
                { user1: user2, user2: user1 },
            ],
            relations: ['messages', 'messages.sender'],
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        return conversation.messages;
    }

    async getRecentConversations(username: string): Promise<Conversation[]> {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['conversationsAsUser1', 'conversationsAsUser2'] });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const conversations = await this.conversationRepository.find({
            where: [
                { user1: user },
                { user2: user },
            ],
            order: { lastMessageAt: 'DESC' },
            relations: ['messages', 'user1', 'user2', 'messages.sender'],
        });

        return conversations;
    }
}
