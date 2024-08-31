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
exports.Homefeed = void 0;
const typeorm_1 = require("typeorm");
const like_entity_1 = require("../like/like.entity");
const repost_entity_1 = require("../repost/repost.entity");
const save_entity_1 = require("../save/save.entity");
const comment_entity_1 = require("../comment/comment.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const user_interaction_entity_1 = require("./user-interaction.entity");
const notification_entity_1 = require("../notification/notification.entity");
let Homefeed = class Homefeed {
};
exports.Homefeed = Homefeed;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Homefeed.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "picture", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "weblink", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Homefeed.prototype, "lock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Homefeed.prototype, "privacy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Homefeed.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.homefeedItem, { cascade: true }),
    __metadata("design:type", Array)
], Homefeed.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => repost_entity_1.Repost, (repost) => repost.homefeedItem, { cascade: true }),
    __metadata("design:type", Array)
], Homefeed.prototype, "reposts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => save_entity_1.Save, (save) => save.homefeedItem, { cascade: true }),
    __metadata("design:type", Array)
], Homefeed.prototype, "saves", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.homefeedItem, { cascade: true }),
    __metadata("design:type", Array)
], Homefeed.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_interaction_entity_1.UserInteraction, (interaction) => interaction.homefeedItem, { cascade: true }),
    __metadata("design:type", Array)
], Homefeed.prototype, "interactions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (user) => user.createdPosts),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], Homefeed.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.homefeedItem),
    __metadata("design:type", Array)
], Homefeed.prototype, "notifications", void 0);
exports.Homefeed = Homefeed = __decorate([
    (0, typeorm_1.Entity)()
], Homefeed);
//# sourceMappingURL=homefeed.entity.js.map