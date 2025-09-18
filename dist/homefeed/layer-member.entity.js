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
exports.LayerMember = exports.LayerRole = void 0;
const typeorm_1 = require("typeorm");
const linked_card_layer_entity_1 = require("./linked-card-layer.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
var LayerRole;
(function (LayerRole) {
    LayerRole["OWNER"] = "owner";
    LayerRole["ADMIN"] = "admin";
    LayerRole["MEMBER"] = "member";
    LayerRole["VIEWER"] = "viewer";
})(LayerRole || (exports.LayerRole = LayerRole = {}));
let LayerMember = class LayerMember {
};
exports.LayerMember = LayerMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LayerMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => linked_card_layer_entity_1.LinkedCardLayer, (l) => l.members, { onDelete: 'CASCADE' }),
    __metadata("design:type", linked_card_layer_entity_1.LinkedCardLayer)
], LayerMember.prototype, "layer", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (u) => u.layerMemberships, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], LayerMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: LayerRole, default: LayerRole.MEMBER }),
    __metadata("design:type", String)
], LayerMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LayerMember.prototype, "isActive", void 0);
exports.LayerMember = LayerMember = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['layer', 'user'])
], LayerMember);
//# sourceMappingURL=layer-member.entity.js.map