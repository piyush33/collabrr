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
exports.RepostController = void 0;
const common_1 = require("@nestjs/common");
const repost_service_1 = require("./repost.service");
let RepostController = class RepostController {
    constructor(repostService) {
        this.repostService = repostService;
    }
    async repostItem(username, homefeedItemId) {
        return this.repostService.repostItem(username, homefeedItemId);
    }
    async hasReposted(username, homefeedItemId) {
        const hasReposted = await this.repostService.hasReposted(username, homefeedItemId);
        return { hasReposted };
    }
    async unRepostHomefeedItem(username, homefeedItemId) {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.repostService.unRepostItem(username, homefeedItemId);
    }
};
exports.RepostController = RepostController;
__decorate([
    (0, common_1.Post)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "repostItem", null);
__decorate([
    (0, common_1.Get)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "hasReposted", null);
__decorate([
    (0, common_1.Delete)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RepostController.prototype, "unRepostHomefeedItem", null);
exports.RepostController = RepostController = __decorate([
    (0, common_1.Controller)('reposts'),
    __metadata("design:paramtypes", [repost_service_1.RepostService])
], RepostController);
//# sourceMappingURL=repost.controller.js.map