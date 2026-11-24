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
exports.OrgAiResult = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../organization/organization.entity");
let OrgAiResult = class OrgAiResult {
};
exports.OrgAiResult = OrgAiResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrgAiResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", organization_entity_1.Organization)
], OrgAiResult.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32 }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16 }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80, nullable: true }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], OrgAiResult.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OrgAiResult.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], OrgAiResult.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], OrgAiResult.prototype, "updatedAt", void 0);
exports.OrgAiResult = OrgAiResult = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['organization', 'kind', 'scope', 'signature']),
    (0, typeorm_1.Index)(['organization', 'kind', 'scope'])
], OrgAiResult);
//# sourceMappingURL=org-ai-result.entity.js.map