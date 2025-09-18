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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const message_entity_1 = require("./message.entity");
const organization_entity_1 = require("../organization/organization.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { nullable: true, eager: true }),
    __metadata("design:type", organization_entity_1.Organization)
], Conversation.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { nullable: true, eager: true }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], Conversation.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (u) => u.conversationsAsUser1, { eager: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], Conversation.prototype, "user1", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (u) => u.conversationsAsUser2, { eager: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], Conversation.prototype, "user2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (m) => m.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)()
], Conversation);
//# sourceMappingURL=conversation.entity.js.map