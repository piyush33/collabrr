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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
let MessageController = class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
    }
    sendOrgMessage(orgId, senderUsername, recipientUsername, content) {
        return this.messageService.sendOrgMessage(orgId, senderUsername, recipientUsername, content);
    }
    getOrgConversationHistory(orgId, user1Username, user2Username) {
        return this.messageService.getOrgConversationHistory(orgId, user1Username, user2Username);
    }
    getOrgRecentConversations(orgId, username) {
        return this.messageService.getOrgRecentConversations(orgId, username);
    }
    sendLayerMessage(layerId, senderUsername, recipientUsername, content) {
        return this.messageService.sendLayerMessage(layerId, senderUsername, recipientUsername, content);
    }
    getLayerConversationHistory(layerId, user1Username, user2Username) {
        return this.messageService.getLayerConversationHistory(layerId, user1Username, user2Username);
    }
    getLayerRecentConversations(layerId, username) {
        return this.messageService.getLayerRecentConversations(layerId, username);
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Post)('orgs/:orgId/messages/:sender/:recipient'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sender')),
    __param(2, (0, common_1.Param)('recipient')),
    __param(3, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendOrgMessage", null);
__decorate([
    (0, common_1.Get)('orgs/:orgId/messages/conversation/:user1/:user2'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('user1')),
    __param(2, (0, common_1.Param)('user2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getOrgConversationHistory", null);
__decorate([
    (0, common_1.Get)('orgs/:orgId/messages/recent/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getOrgRecentConversations", null);
__decorate([
    (0, common_1.Post)('layers/:layerId/messages/:sender/:recipient'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('sender')),
    __param(2, (0, common_1.Param)('recipient')),
    __param(3, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendLayerMessage", null);
__decorate([
    (0, common_1.Get)('layers/:layerId/messages/conversation/:user1/:user2'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('user1')),
    __param(2, (0, common_1.Param)('user2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getLayerConversationHistory", null);
__decorate([
    (0, common_1.Get)('layers/:layerId/messages/recent/:username'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getLayerRecentConversations", null);
exports.MessageController = MessageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
//# sourceMappingURL=message.controller.js.map