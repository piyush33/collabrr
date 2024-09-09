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
exports.Activity = void 0;
const typeorm_1 = require("typeorm");
const actor_entity_1 = require("../actor/actor.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
let Activity = class Activity {
};
exports.Activity = Activity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Activity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Activity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Activity.prototype, "object", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Activity.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => actor_entity_1.Actor, (actor) => actor.activities),
    __metadata("design:type", actor_entity_1.Actor)
], Activity.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => homefeed_entity_1.Homefeed, (homefeed) => homefeed.activities),
    __metadata("design:type", homefeed_entity_1.Homefeed)
], Activity.prototype, "homeFeed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Activity.prototype, "published", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('activities')
], Activity);
//# sourceMappingURL=activity.entity.js.map