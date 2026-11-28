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
exports.ThinkController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const homefeed_service_1 = require("../homefeed.service");
const think_service_1 = require("./think.service");
const converge_service_1 = require("./converge.service");
let ThinkController = class ThinkController {
    constructor(think, converge, homefeed) {
        this.think = think;
        this.converge = converge;
        this.homefeed = homefeed;
    }
    username(req) {
        const u = req?.user?.username;
        if (!u)
            throw new common_1.UnauthorizedException();
        return u;
    }
    start(orgId, kind, body, req) {
        return this.think.start(orgId, this.username(req), kind, body);
    }
    task(orgId, id, req) {
        return this.think.get(orgId, this.username(req), id);
    }
    async state(orgId, layerId, req) {
        await this.homefeed.assertLayerAccess(orgId, this.username(req), layerId);
        return this.converge.state(layerId);
    }
    async vote(orgId, layerId, body, req) {
        const username = this.username(req);
        await this.homefeed.assertLayerAccess(orgId, username, layerId);
        if (!body?.pointId)
            throw new common_1.BadRequestException('pointId is required');
        return this.converge.vote(layerId, username, String(body.pointId), body.position ?? null);
    }
    async timer(orgId, layerId, body, req) {
        const username = this.username(req);
        await this.homefeed.assertLayerAccess(orgId, username, layerId);
        if (!body?.pointId || !body?.op)
            throw new common_1.BadRequestException('pointId and op are required');
        return this.converge.timer(layerId, username, String(body.pointId), String(body.op), body.durationMs);
    }
};
exports.ThinkController = ThinkController;
__decorate([
    (0, common_1.Post)('think/:kind'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('kind')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ThinkController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('think/tasks/:id'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], ThinkController.prototype, "task", null);
__decorate([
    (0, common_1.Get)('layers/:layerId/converge'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ThinkController.prototype, "state", null);
__decorate([
    (0, common_1.Post)('layers/:layerId/converge/vote'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ThinkController.prototype, "vote", null);
__decorate([
    (0, common_1.Post)('layers/:layerId/converge/timer'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ThinkController.prototype, "timer", null);
exports.ThinkController = ThinkController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orgs/:orgId/homefeed'),
    __metadata("design:paramtypes", [think_service_1.ThinkService,
        converge_service_1.ConvergeService,
        homefeed_service_1.HomefeedService])
], ThinkController);
//# sourceMappingURL=think.controller.js.map