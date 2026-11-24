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
exports.LayerSummary = void 0;
const typeorm_1 = require("typeorm");
const linked_card_layer_entity_1 = require("./linked-card-layer.entity");
let LayerSummary = class LayerSummary {
};
exports.LayerSummary = LayerSummary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LayerSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], LayerSummary.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], LayerSummary.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80, nullable: true }),
    __metadata("design:type", String)
], LayerSummary.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], LayerSummary.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], LayerSummary.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], LayerSummary.prototype, "updatedAt", void 0);
exports.LayerSummary = LayerSummary = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['layer', 'signature'])
], LayerSummary);
//# sourceMappingURL=layer-summary.entity.js.map