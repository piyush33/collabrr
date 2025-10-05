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
exports.Homefeed = exports.Visibility = void 0;
const typeorm_1 = require("typeorm");
const like_entity_1 = require("../like/like.entity");
const repost_entity_1 = require("../repost/repost.entity");
const save_entity_1 = require("../save/save.entity");
const comment_entity_1 = require("../comment/comment.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const user_interaction_entity_1 = require("./user-interaction.entity");
const notification_entity_1 = require("../notification/notification.entity");
const organization_entity_1 = require("../organization/organization.entity");
const linked_card_layer_entity_1 = require("./linked-card-layer.entity");
const team_entity_1 = require("../organization/team.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const content_metadata_enum_1 = require("../common/enums/content-metadata.enum");
var Visibility;
(function (Visibility) {
    Visibility["ORG"] = "org";
    Visibility["LAYER"] = "layer";
    Visibility["PRIVATE"] = "private";
    Visibility["TEAM"] = "team";
})(Visibility || (exports.Visibility = Visibility = {}));
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
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { nullable: true, eager: false }),
    __metadata("design:type", team_entity_1.Team)
], Homefeed.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (o) => o.posts, { eager: true }),
    __metadata("design:type", organization_entity_1.Organization)
], Homefeed.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, (layer) => layer.cards, {
        nullable: true,
        eager: false,
    }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], Homefeed.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Visibility, default: Visibility.ORG }),
    __metadata("design:type", String)
], Homefeed.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Homefeed.prototype, "category", void 0);
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
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.homefeedItem, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Homefeed.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_interaction_entity_1.UserInteraction, (interaction) => interaction.homefeedItem, {
        cascade: true,
    }),
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
__decorate([
    (0, typeorm_1.OneToOne)(() => profilefeed_item_entity_1.ProfileFeedItem, (p) => p.homefeedItem, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'profileFeedItemId' }),
    __metadata("design:type", profilefeed_item_entity_1.ProfileFeedItem)
], Homefeed.prototype, "profileFeedItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Homefeed.prototype, "profileFeedItemId", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_homefeed_phase'),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: content_metadata_enum_1.Phase,
        enumName: 'phase_enum',
        nullable: true,
    }),
    __metadata("design:type", String)
], Homefeed.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: content_metadata_enum_1.RoleType,
        enumName: 'role_type_enum',
        array: true,
        default: '{}',
    }),
    __metadata("design:type", Array)
], Homefeed.prototype, "roleTypes", void 0);
exports.Homefeed = Homefeed = __decorate([
    (0, typeorm_1.Entity)()
], Homefeed);
//# sourceMappingURL=homefeed.entity.js.map