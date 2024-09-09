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
exports.Actor = void 0;
const typeorm_1 = require("typeorm");
const activity_entity_1 = require("../activity/activity.entity");
let Actor = class Actor {
    get inboxUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/inbox`;
    }
    get outboxUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/outbox`;
    }
    get followersUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/followers`;
    }
    get followingUrl() {
        return `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${this.preferredUsername}/following`;
    }
};
exports.Actor = Actor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Actor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "preferredUsername", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "inbox", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "outbox", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "followers", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "following", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "publicKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actor.prototype, "privateKey", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_entity_1.Activity, (activity) => activity.actor),
    __metadata("design:type", Array)
], Actor.prototype, "activities", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Actor.prototype, "summary", void 0);
exports.Actor = Actor = __decorate([
    (0, typeorm_1.Entity)('actors')
], Actor);
//# sourceMappingURL=actor.entity.js.map