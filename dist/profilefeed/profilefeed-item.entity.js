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
exports.ProfileFeedItem = void 0;
const typeorm_1 = require("typeorm");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const like_entity_1 = require("../like/like.entity");
const repost_entity_1 = require("../repost/repost.entity");
const save_entity_1 = require("../save/save.entity");
const organization_entity_1 = require("../organization/organization.entity");
const team_entity_1 = require("../organization/team.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const content_metadata_enum_1 = require("../common/enums/content-metadata.enum");
var Visibility;
(function (Visibility) {
    Visibility["ORG"] = "org";
    Visibility["LAYER"] = "layer";
    Visibility["PRIVATE"] = "private";
    Visibility["TEAM"] = "team";
})(Visibility || (Visibility = {}));
let ProfileFeedItem = class ProfileFeedItem {
};
exports.ProfileFeedItem = ProfileFeedItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProfileFeedItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "picture", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ProfileFeedItem.prototype, "layerKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "weblink", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], ProfileFeedItem.prototype, "lock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], ProfileFeedItem.prototype, "privacy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Visibility, default: Visibility.ORG }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { nullable: true, eager: true }),
    __metadata("design:type", team_entity_1.Team)
], ProfileFeedItem.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (o) => o.profilePosts, { eager: true }),
    __metadata("design:type", organization_entity_1.Organization)
], ProfileFeedItem.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (user) => user.created),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], ProfileFeedItem.prototype, "userCreated", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (user) => user.reposted),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], ProfileFeedItem.prototype, "userReposted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (user) => user.liked),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], ProfileFeedItem.prototype, "userLiked", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (user) => user.saved),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], ProfileFeedItem.prototype, "userSaved", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => like_entity_1.Like, (like) => like.feedItem),
    __metadata("design:type", Array)
], ProfileFeedItem.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => repost_entity_1.Repost, (repost) => repost.feedItem),
    __metadata("design:type", Array)
], ProfileFeedItem.prototype, "reposts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => save_entity_1.Save, (save) => save.feedItem),
    __metadata("design:type", Array)
], ProfileFeedItem.prototype, "saves", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => homefeed_entity_1.Homefeed, (h) => h.profileFeedItem, {
        nullable: true,
        onDelete: 'SET NULL',
        eager: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'homefeedItemId' }),
    __metadata("design:type", homefeed_entity_1.Homefeed)
], ProfileFeedItem.prototype, "homefeedItem", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_profilefeed_phase'),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: content_metadata_enum_1.Phase,
        enumName: 'phase_enum',
        nullable: true,
    }),
    __metadata("design:type", String)
], ProfileFeedItem.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: content_metadata_enum_1.RoleType,
        enumName: 'role_type_enum',
        array: true,
        default: '{}',
    }),
    __metadata("design:type", Array)
], ProfileFeedItem.prototype, "roleTypes", void 0);
exports.ProfileFeedItem = ProfileFeedItem = __decorate([
    (0, typeorm_1.Entity)()
], ProfileFeedItem);
//# sourceMappingURL=profilefeed-item.entity.js.map