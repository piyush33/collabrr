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
exports.HomefeedController = void 0;
const common_1 = require("@nestjs/common");
const homefeed_service_1 = require("./homefeed.service");
let HomefeedController = class HomefeedController {
    constructor(homefeedService) {
        this.homefeedService = homefeedService;
    }
    getHomeFeed(orgId, username, limit) {
        const lim = Number(limit ?? 50) || 50;
        return this.homefeedService.getHomeFeed(orgId, username, lim);
    }
    findOne(orgId, id, username) {
        return this.homefeedService.findOne(orgId, id, username);
    }
    create(orgId, username, body) {
        const { allowedMemberIds, ...card } = body;
        return this.homefeedService.create(orgId, username, card, {
            allowedMemberIds,
        });
    }
    update(orgId, id, username, patch) {
        return this.homefeedService.update(orgId, id, username, patch);
    }
    remove(orgId, id, username) {
        return this.homefeedService.remove(orgId, id, username);
    }
    getLayerCards(orgId, layerId, username, limit) {
        const lim = Number(limit ?? 50) || 50;
        return this.homefeedService.getLayerFeed(orgId, username, layerId, lim);
    }
};
exports.HomefeedController = HomefeedController;
__decorate([
    (0, common_1.Get)('user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "getHomeFeed", null);
__decorate([
    (0, common_1.Get)('item/:id/user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('item/:id/user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('username')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('item/:id/user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('/layers/:layerId/cards'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('username')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], HomefeedController.prototype, "getLayerCards", null);
exports.HomefeedController = HomefeedController = __decorate([
    (0, common_1.Controller)('orgs/:orgId/homefeed'),
    __metadata("design:paramtypes", [homefeed_service_1.HomefeedService])
], HomefeedController);
//# sourceMappingURL=homefeed.controller.js.map