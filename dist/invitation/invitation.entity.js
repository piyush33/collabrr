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
exports.Invitation = exports.InviteStatus = exports.InviteScope = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../organization/organization.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
var InviteScope;
(function (InviteScope) {
    InviteScope["ORG"] = "org";
    InviteScope["LAYER"] = "layer";
})(InviteScope || (exports.InviteScope = InviteScope = {}));
var InviteStatus;
(function (InviteStatus) {
    InviteStatus["PENDING"] = "pending";
    InviteStatus["ACCEPTED"] = "accepted";
    InviteStatus["EXPIRED"] = "expired";
    InviteStatus["REVOKED"] = "revoked";
})(InviteStatus || (exports.InviteStatus = InviteStatus = {}));
let Invitation = class Invitation {
};
exports.Invitation = Invitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Invitation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InviteScope }),
    __metadata("design:type", String)
], Invitation.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { nullable: true, eager: true }),
    __metadata("design:type", organization_entity_1.Organization)
], Invitation.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { nullable: true, eager: true }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], Invitation.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invitation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, { nullable: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], Invitation.prototype, "invitedBy", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invitation.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Invitation.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING }),
    __metadata("design:type", String)
], Invitation.prototype, "status", void 0);
exports.Invitation = Invitation = __decorate([
    (0, typeorm_1.Entity)()
], Invitation);
//# sourceMappingURL=invitation.entity.js.map