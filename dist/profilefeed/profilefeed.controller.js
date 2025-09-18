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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProfileFeedController = class ProfileFeedController {
    constructor(profileFeedService) {
        this.profileFeedService = profileFeedService;
    }
    async findAll(orgId) {
        return this.profileFeedService.findAll(orgId);
    }
    async findOne(orgId, id) {
        return this.profileFeedService.findOne(orgId, id);
    }
    async findAllByFeedType(orgId, subjectUsername, feedType, req) {
        const viewerUsername = req.user.username;
        return this.profileFeedService.findAllByFeedType(Number(orgId), subjectUsername, feedType, viewerUsername);
    }
    async create(orgId, username, feedType, createFeedItemDto) {
        return this.profileFeedService.create(orgId, username, createFeedItemDto, feedType);
    }
    async update(orgId, id, updateFeedItemDto) {
        return this.profileFeedService.update(orgId, id, updateFeedItemDto);
    }
    async deleteProfileFeedItem(orgId, username, feedType, id) {
        await this.profileFeedService.delete(orgId, username, id, feedType);
    }
};
exports.ProfileFeedController = ProfileFeedController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('item/:id'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':username/:feedType'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('feedType')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "findAllByFeedType", null);
__decorate([
    (0, common_1.Post)(':username/:feedType'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('feedType')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, create_profilefeed_item_dto_1.CreateProfileFeedItemDto]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('item/:id'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':username/:feedType/:id'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('feedType')),
    __param(3, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Number]),
    __metadata("design:returntype", Promise)
], ProfileFeedController.prototype, "deleteProfileFeedItem", null);
exports.ProfileFeedController = ProfileFeedController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orgs/:orgId/profilefeed'),
    __metadata("design:paramtypes", [profilefeed_service_1.ProfileFeedService])
], ProfileFeedController);
//# sourceMappingURL=profilefeed.controller.js.map