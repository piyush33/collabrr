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
exports.AcceptInviteDto = exports.CreateLayerInviteDto = exports.CreateOrgInviteDto = void 0;
const class_validator_1 = require("class-validator");
const organization_member_entity_1 = require("../organization/organization-member.entity");
class CreateOrgInviteDto {
}
exports.CreateOrgInviteDto = CreateOrgInviteDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateOrgInviteDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(organization_member_entity_1.OrgRole),
    __metadata("design:type", String)
], CreateOrgInviteDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24 * 30),
    __metadata("design:type", Number)
], CreateOrgInviteDto.prototype, "expiresInHours", void 0);
class CreateLayerInviteDto {
}
exports.CreateLayerInviteDto = CreateLayerInviteDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateLayerInviteDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24 * 30),
    __metadata("design:type", Number)
], CreateLayerInviteDto.prototype, "expiresInHours", void 0);
class AcceptInviteDto {
}
exports.AcceptInviteDto = AcceptInviteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInviteDto.prototype, "token", void 0);
//# sourceMappingURL=invitation.dtos.js.map