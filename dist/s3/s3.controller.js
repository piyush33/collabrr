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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const s3_service_1 = require("./s3.service");
let UploadController = class UploadController {
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async uploadFeedItemImage(file) {
        const imageUrl = await this.s3Service.uploadFile(file, 'feed-items');
        return { imageUrl };
    }
    async uploadProfileImage(file) {
        const imageUrl = await this.s3Service.uploadFile(file, 'profile-images');
        return { imageUrl };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('feed-item'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFeedItemImage", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadProfileImage", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], UploadController);
//# sourceMappingURL=s3.controller.js.map