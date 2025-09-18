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
exports.ProfileusersController = void 0;
const common_1 = require("@nestjs/common");
const profileusers_service_1 = require("./profileusers.service");
const profileuser_dto_1 = require("../dto/profileuser.dto");
let ProfileusersController = class ProfileusersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    findOne(orgId, username) {
        return this.usersService.findOne(orgId, username);
    }
    create(orgId, createUserDto) {
        return this.usersService.create(orgId, createUserDto);
    }
    update(orgId, username, updateUserDto) {
        return this.usersService.update(orgId, username, updateUserDto);
    }
    async addFollower(orgId, username, followerDto) {
        return this.usersService.addFollower(orgId, username, followerDto);
    }
    async addFollowing(orgId, username, followingDto) {
        return this.usersService.addFollowing(orgId, username, followingDto);
    }
    async getFollowers(orgId, username) {
        return this.usersService.getFollowers(orgId, username);
    }
    async getFollowing(orgId, username) {
        return this.usersService.getFollowing(orgId, username);
    }
    async removeFollowing(orgId, username, followingId) {
        return this.usersService.removeFollowing(orgId, username, followingId);
    }
    async removeFollower(orgId, username, followerId) {
        return this.usersService.removeFollower(orgId, username, followerId);
    }
    async updateFollowerStatus(orgId, username, followerId, isFollowing) {
        return this.usersService.updateFollowerStatus(orgId, username, followerId, isFollowing);
    }
};
exports.ProfileusersController = ProfileusersController;
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':username/followers'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, profileuser_dto_1.FollowerDto]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "addFollower", null);
__decorate([
    (0, common_1.Post)(':username/following'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, profileuser_dto_1.FollowingDto]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "addFollowing", null);
__decorate([
    (0, common_1.Get)(':username/followers'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)(':username/following'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Delete)(':username/following/:followingId'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('followingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "removeFollowing", null);
__decorate([
    (0, common_1.Delete)(':username/followers/:followerId'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('followerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "removeFollower", null);
__decorate([
    (0, common_1.Patch)(':username/followers/:followerId'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __param(2, (0, common_1.Param)('followerId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)('isFollowing')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "updateFollowerStatus", null);
exports.ProfileusersController = ProfileusersController = __decorate([
    (0, common_1.Controller)('orgs/:orgId/profileusers'),
    __metadata("design:paramtypes", [profileusers_service_1.ProfileusersService])
], ProfileusersController);
//# sourceMappingURL=profileusers.controller.js.map