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
exports.Organization = exports.JoinPolicy = void 0;
const typeorm_1 = require("typeorm");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const organization_member_entity_1 = require("./organization-member.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
var JoinPolicy;
(function (JoinPolicy) {
    JoinPolicy["INVITE_ONLY"] = "invite";
    JoinPolicy["DOMAIN"] = "domain";
    JoinPolicy["OPEN"] = "open";
})(JoinPolicy || (exports.JoinPolicy = JoinPolicy = {}));
let Organization = class Organization {
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Organization.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Organization.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: JoinPolicy, default: JoinPolicy.INVITE_ONLY }),
    __metadata("design:type", String)
], Organization.prototype, "joinPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], Organization.prototype, "allowedDomains", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => organization_member_entity_1.OrganizationMember, (m) => m.organization),
    __metadata("design:type", Array)
], Organization.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => homefeed_entity_1.Homefeed, (h) => h.organization),
    __metadata("design:type", Array)
], Organization.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profilefeed_item_entity_1.ProfileFeedItem, (h) => h.organization),
    __metadata("design:type", Array)
], Organization.prototype, "profilePosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => linked_card_layer_entity_1.LinkedCardLayer, (l) => l.organization),
    __metadata("design:type", Array)
], Organization.prototype, "layers", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)()
], Organization);
//# sourceMappingURL=organization.entity.js.map