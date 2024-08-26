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
exports.SaveController = void 0;
const common_1 = require("@nestjs/common");
const save_service_1 = require("./save.service");
let SaveController = class SaveController {
    constructor(saveService) {
        this.saveService = saveService;
    }
    async saveItem(username, homefeedItemId) {
        return this.saveService.saveItem(username, homefeedItemId);
    }
    async hasSaved(username, homefeedItemId) {
        const hasSaved = await this.saveService.hasSaved(username, homefeedItemId);
        return { hasSaved };
    }
    async unSaveHomefeedItem(username, homefeedItemId) {
        console.log(`Received request to unlike homefeed item. Username: ${username}, HomefeedItemId: ${homefeedItemId}`);
        await this.saveService.unSaveItem(username, homefeedItemId);
    }
};
exports.SaveController = SaveController;
__decorate([
    (0, common_1.Post)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SaveController.prototype, "saveItem", null);
__decorate([
    (0, common_1.Get)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SaveController.prototype, "hasSaved", null);
__decorate([
    (0, common_1.Delete)('homefeed/:username/:homefeedItemId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('homefeedItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SaveController.prototype, "unSaveHomefeedItem", null);
exports.SaveController = SaveController = __decorate([
    (0, common_1.Controller)('saves'),
    __metadata("design:paramtypes", [save_service_1.SaveService])
], SaveController);
//# sourceMappingURL=save.controller.js.map