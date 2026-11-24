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
exports.AiJob = void 0;
const typeorm_1 = require("typeorm");
const linked_card_layer_entity_1 = require("../linked-card-layer.entity");
let AiJob = class AiJob {
};
exports.AiJob = AiJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AiJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], AiJob.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32 }),
    __metadata("design:type", String)
], AiJob.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], AiJob.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16 }),
    __metadata("design:type", String)
], AiJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AiJob.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AiJob.prototype, "updatedAt", void 0);
exports.AiJob = AiJob = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['layer', 'kind', 'signature'])
], AiJob);
//# sourceMappingURL=ai-job.entity.js.map