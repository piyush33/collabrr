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
exports.ProfileFeedController = void 0;
const common_1 = require("@nestjs/common");
const profilefeed_service_1 = require("./profilefeed.service");
const create_profilefeed_item_dto_1 = require("../dto/create-profilefeed-item.dto");
let ProfileFeedController = class ProfileFeedController {
    constructor(profileFeedService) {
        this.profileFeedService = profileFeedService;
    }
    async findAll() {
        return this.profileFeedService.findAll();
    }
    async findOne(id) {
        return this.profileFeedService.findOne(id);
    }
    async findAllByFeedType(username, feedType) {
        return this.profileFeedService.findAllByFeedType(username, feedType);
    }
    async create(username, feedType, createFeedItemDto) {
        return this.profileFeedService.create(username, createFeedItemDto, feedType);
    }
    async update(id, updateFeedItemDto) {
        return this.profileFeedService.update(id, updateFeedItemDto);
    }
    async deleteProfileFeedItem(username, feedType, id) {
        await this.profileFeedService.delete(username, id, feedType);
    }
};
exports.ProfileFeedController = ProfileFeedController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':username/:feedType'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('feedType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findAllByFeedType", null);
__decorate([
    (0, common_1.Post)(':username/:feedType'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('feedType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_profilefeed_item_dto_1.CreateProfileFeedItemDto]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':username/:feedType/:id'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('feedType')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "deleteProfileFeedItem", null);
exports.ProfileFeedController = ProfileFeedController = __decorate([
    (0, common_1.Controller)('profilefeed'),
    __metadata("design:paramtypes", [profilefeed_service_1.ProfileFeedService])
], ProfileFeedController);
//# sourceMappingURL=profilefeed.controller.js.map