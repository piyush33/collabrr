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
exports.ProfileUser = void 0;
const typeorm_1 = require("typeorm");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const follower_entity_1 = require("./follower.entity");
const like_entity_1 = require("../like/like.entity");
const repost_entity_1 = require("../repost/repost.entity");
const save_entity_1 = require("../save/save.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const user_interaction_entity_1 = require("../homefeed/user-interaction.entity");
const conversation_entity_1 = require("../message/conversation.entity");
const message_entity_1 = require("../message/message.entity");
const notification_entity_1 = require("../notification/notification.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const team_member_entity_1 = require("../organization/team-member.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
let ProfileUser = class ProfileUser {
};
exports.ProfileUser = ProfileUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProfileUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProfileUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileUser.prototype, "tagline", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ProfileUser.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileUser.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.sender),
    __metadata("design:type", Array)
], ProfileUser.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, (m) => m.user),
    __metadata("design:type", Array)
], ProfileUser.prototype, "teamMemberships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => layer_member_entity_1.LayerMember, (m) => m.user),
    __metadata("design:type", Array)
], ProfileUser.prototype, "layerMemberships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => organization_member_entity_1.OrganizationMember, (m) => m.user),
    __metadata("design:type", Array)
], ProfileUser.prototype, "orgMemberships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.user1),
    __metadata("design:type", Array)
], ProfileUser.prototype, "conversationsAsUser1", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conversation) => conversation.user2),
    __metadata("design:type", Array)
], ProfileUser.prototype, "conversationsAsUser2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => follower_entity_1.Follower, (follower) => follower.user, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "followers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => follower_entity_1.Following, (following) => following.user, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "following", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => homefeed_entity_1.Homefeed, (item) => item.createdBy, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "createdPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profilefeed_item_entity_1.ProfileFeedItem, (item) => item.userCreated, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profilefeed_item_entity_1.ProfileFeedItem, (item) => item.userReposted),
    __metadata("design:type", Array)
], ProfileUser.prototype, "reposted", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profilefeed_item_entity_1.ProfileFeedItem, (item) => item.userLiked),
    __metadata("design:type", Array)
], ProfileUser.prototype, "liked", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profilefeed_item_entity_1.ProfileFeedItem, (item) => item.userSaved),
    __metadata("design:type", Array)
], ProfileUser.prototype, "saved", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.user, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => repost_entity_1.Repost, (repost) => repost.user, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "reposts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => save_entity_1.Save, (save) => save.user, { cascade: true }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "saves", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_interaction_entity_1.UserInteraction, (interaction) => interaction.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ProfileUser.prototype, "interactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.targetUser),
    __metadata("design:type", Array)
], ProfileUser.prototype, "notificationsReceived", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], ProfileUser.prototype, "notifications", void 0);
exports.ProfileUser = ProfileUser = __decorate([
    (0, typeorm_1.Entity)()
], ProfileUser);
//# sourceMappingURL=profileuser.entity.js.map