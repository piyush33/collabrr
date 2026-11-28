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
exports.ConvergeTimer = exports.ConvergeVote = exports.ConvergeReading = exports.ThinkTask = void 0;
const typeorm_1 = require("typeorm");
const linked_card_layer_entity_1 = require("../linked-card-layer.entity");
let ThinkTask = class ThinkTask {
};
exports.ThinkTask = ThinkTask;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], ThinkTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ThinkTask.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ThinkTask.prototype, "layerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], ThinkTask.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32 }),
    __metadata("design:type", String)
], ThinkTask.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 16 }),
    __metadata("design:type", String)
], ThinkTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ThinkTask.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ThinkTask.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ThinkTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ThinkTask.prototype, "updatedAt", void 0);
exports.ThinkTask = ThinkTask = __decorate([
    (0, typeorm_1.Entity)()
], ThinkTask);
let ConvergeReading = class ConvergeReading {
};
exports.ConvergeReading = ConvergeReading;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConvergeReading.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], ConvergeReading.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], ConvergeReading.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], ConvergeReading.prototype, "signature", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ConvergeReading.prototype, "updatedAt", void 0);
exports.ConvergeReading = ConvergeReading = __decorate([
    (0, typeorm_1.Entity)()
], ConvergeReading);
let ConvergeVote = class ConvergeVote {
};
exports.ConvergeVote = ConvergeVote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConvergeVote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], ConvergeVote.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], ConvergeVote.prototype, "pointId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], ConvergeVote.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ConvergeVote.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ConvergeVote.prototype, "updatedAt", void 0);
exports.ConvergeVote = ConvergeVote = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['layer', 'pointId', 'username'])
], ConvergeVote);
let ConvergeTimer = class ConvergeTimer {
};
exports.ConvergeTimer = ConvergeTimer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConvergeTimer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, { onDelete: 'CASCADE', nullable: false }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], ConvergeTimer.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], ConvergeTimer.prototype, "pointId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ConvergeTimer.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], ConvergeTimer.prototype, "remainingMs", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ConvergeTimer.prototype, "running", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], ConvergeTimer.prototype, "setBy", void 0);
exports.ConvergeTimer = ConvergeTimer = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['layer', 'pointId'])
], ConvergeTimer);
//# sourceMappingURL=think.entities.js.map