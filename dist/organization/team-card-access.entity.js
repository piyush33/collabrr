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
exports.TeamCardAccess = void 0;
const typeorm_1 = require("typeorm");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
let TeamCardAccess = class TeamCardAccess {
};
exports.TeamCardAccess = TeamCardAccess;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeamCardAccess.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => homefeed_entity_1.Homefeed, { onDelete: 'CASCADE' }),
    __metadata("design:type", homefeed_entity_1.Homefeed)
], TeamCardAccess.prototype, "homefeed", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => profileuser_entity_1.ProfileUser, (u) => u.teamMemberships, { eager: true }),
    __metadata("design:type", profileuser_entity_1.ProfileUser)
], TeamCardAccess.prototype, "user", void 0);
exports.TeamCardAccess = TeamCardAccess = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(['homefeed', 'user'])
], TeamCardAccess);
//# sourceMappingURL=team-card-access.entity.js.map