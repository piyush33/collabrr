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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceIdeasController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const space_ideas_service_1 = require("./space-ideas.service");
let SpaceIdeasController = class SpaceIdeasController {
    constructor(ideas) {
        this.ideas = ideas;
    }
    username(req) {
        const u = req?.user?.username;
        if (!u)
            throw new common_1.UnauthorizedException();
        return u;
    }
    start(orgId, body, req) {
        return this.ideas.start(orgId, this.username(req), body ?? {});
    }
    status(orgId, category, signature, req) {
        return this.ideas.status(orgId, this.username(req), category, signature);
    }
};
exports.SpaceIdeasController = SpaceIdeasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], SpaceIdeasController.prototype, "start", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('signature')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", void 0)
], SpaceIdeasController.prototype, "status", null);
exports.SpaceIdeasController = SpaceIdeasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orgs/:orgId/homefeed/ai/space-ideas'),
    __metadata("design:paramtypes", [space_ideas_service_1.SpaceIdeasService])
], SpaceIdeasController);
//# sourceMappingURL=space-ideas.controller.js.map