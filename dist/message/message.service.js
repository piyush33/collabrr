"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const conversation_entity_1 = require("./conversation.entity");
let MessageService = class MessageService {
    constructor(messageRepository, userRepository, conversationRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
    }
    async sendMessage(senderUsername, recipientUsername, content) {
        const sender = await this.userRepository.findOne({ where: { username: senderUsername } });
        const recipient = await this.userRepository.findOne({ where: { username: recipientUsername } });
        if (!sender || !recipient) {
            throw new common_1.NotFoundException('User not found');
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
    async getConversationHistory(user1Username, user2Username) {
        const user1 = await this.userRepository.findOne({ where: { username: user1Username } });
        const user2 = await this.userRepository.findOne({ where: { username: user2Username } });
        if (!user1 || !user2) {
            throw new common_1.NotFoundException('User not found');
        }
        const conversation = await this.conversationRepository.findOne({
            where: [
                { user1, user2 },
                { user1: user2, user2: user1 },
            ],
            relations: ['messages', 'messages.sender'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation.messages;
    }
    async getRecentConversations(username) {
        const user = await this.userRepository.findOne({ where: { username }, relations: ['conversationsAsUser1', 'conversationsAsUser2'] });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(profileuser_entity_1.ProfileUser)),
    __param(2, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessageService);
//# sourceMappingURL=message.service.js.map