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
exports.LikeController = void 0;
const common_1 = require("@nestjs/common");
const like_service_1 = require("./like.service");
let LikeController = class LikeController {
    constructor(likeService) {
        this.likeService = likeService;
    }
    async likeItem(username, homefeedItemId) {
        return this.likeService.likeItem(username, homefeedItemId);
    }
    async hasLiked(username, homefeedItemId) {
        const hasLiked = await this.likeService.hasLiked(username, homefeedItemId);
        return { hasLiked };
    }
    async unlikeHomefeedItem(username, homefeedItemId) {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.likeService.unlikeItem(username, homefeedItemId);
    }
};
exports.LikeController = LikeController;
__decorate([
    (0, common_1.Post)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LikeController.prototype, "likeItem", null);
__decorate([
    (0, common_1.Get)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LikeController.prototype, "hasLiked", null);
__decorate([
    (0, common_1.Delete)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LikeController.prototype, "unlikeHomefeedItem", null);
exports.LikeController = LikeController = __decorate([
    (0, common_1.Controller)('likes'),
    __metadata("design:paramtypes", [like_service_1.LikeService])
], LikeController);
//# sourceMappingURL=like.controller.js.map