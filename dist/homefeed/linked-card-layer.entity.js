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
exports.LinkedCardLayer = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../organization/organization.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("./homefeed.entity");
const layer_member_entity_1 = require("./layer-member.entity");
let LinkedCardLayer = class LinkedCardLayer {
};
exports.LinkedCardLayer = LinkedCardLayer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LinkedCardLayer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (o) => o.layers, {
        eager: true,
        nullable: false,
    }),
    __metadata("design:type", organization_entity_1.Organization)
], LinkedCardLayer.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, { eager: true, nullable: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], LinkedCardLayer.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LinkedCardLayer.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LinkedCardLayer.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LinkedCardLayer.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => homefeed_entity_1.Homefeed, (c) => c.layer),
    __metadata("design:type", Array)
], LinkedCardLayer.prototype, "cards", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LinkedCardLayer.prototype, "isLocked", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => layer_member_entity_1.LayerMember, (m) => m.layer),
    __metadata("design:type", Array)
], LinkedCardLayer.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], LinkedCardLayer.prototype, "createdAt", void 0);
exports.LinkedCardLayer = LinkedCardLayer = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['organization', 'key'])
], LinkedCardLayer);
//# sourceMappingURL=linked-card-layer.entity.js.map