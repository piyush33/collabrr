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
    findOne(username) {
        return this.usersService.findOne(username);
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    update(username, updateUserDto) {
        return this.usersService.update(username, updateUserDto);
    }
    async addFollower(username, followerDto) {
        return this.usersService.addFollower(username, followerDto);
    }
    async addFollowing(username, followingDto) {
        return this.usersService.addFollowing(username, followingDto);
    }
    async getFollowers(username) {
        return this.usersService.getFollowers(username);
    }
    async getFollowing(username) {
        return this.usersService.getFollowing(username);
    }
    async removeFollowing(username, followingId) {
        return this.usersService.removeFollowing(username, followingId);
    }
    async removeFollower(username, followerId) {
        return this.usersService.removeFollower(username, followerId);
    }
    async updateFollowerStatus(username, followerId, isFollowing) {
        return this.usersService.updateFollowerStatus(username, followerId, isFollowing);
    }
};
exports.ProfileusersController = ProfileusersController;
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':username/followers'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profileuser_dto_1.FollowerDto]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "addFollower", null);
__decorate([
    (0, common_1.Post)(':username/following'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, profileuser_dto_1.FollowingDto]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "addFollowing", null);
__decorate([
    (0, common_1.Get)(':username/followers'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)(':username/following'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Delete)(':username/following/:followingId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('followingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "removeFollowing", null);
__decorate([
    (0, common_1.Delete)(':username/followers/:followerId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('followerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "removeFollower", null);
__decorate([
    (0, common_1.Patch)(':username/followers/:followerId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('followerId')),
    __param(2, (0, common_1.Body)('isFollowing')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], ProfileusersController.prototype, "updateFollowerStatus", null);
exports.ProfileusersController = ProfileusersController = __decorate([
    (0, common_1.Controller)('profileusers'),
    __metadata("design:paramtypes", [profileusers_service_1.ProfileusersService])
], ProfileusersController);
//# sourceMappingURL=profileusers.controller.js.map