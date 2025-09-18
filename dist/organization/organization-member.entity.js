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
exports.OrganizationMember = exports.OrgRole = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("./organization.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
var OrgRole;
(function (OrgRole) {
    OrgRole["OWNER"] = "owner";
    OrgRole["ADMIN"] = "admin";
    OrgRole["MEMBER"] = "member";
    OrgRole["GUEST"] = "guest";
})(OrgRole || (exports.OrgRole = OrgRole = {}));
let OrganizationMember = class OrganizationMember {
};
exports.OrganizationMember = OrganizationMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrganizationMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (o) => o.members, { eager: true }),
    __metadata("design:type", organization_entity_1.Organization)
], OrganizationMember.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (u) => u.orgMemberships, { eager: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], OrganizationMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OrgRole, default: OrgRole.MEMBER }),
    __metadata("design:type", String)
], OrganizationMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], OrganizationMember.prototype, "isActive", void 0);
exports.OrganizationMember = OrganizationMember = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['organization', 'user'])
], OrganizationMember);
//# sourceMappingURL=organization-member.entity.js.map