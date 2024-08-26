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
const homefeed_entity_1 = require("./homefeed.entity");
let HomefeedController = class HomefeedController {
    constructor(homefeedService) {
        this.homefeedService = homefeedService;
    }
    findAll() {
        return this.homefeedService.findAll();
    }
    getHomeFeed(username) {
        return this.homefeedService.getHomeFeed(username);
    }
    findOne(id) {
        return this.homefeedService.findOne(id);
    }
    create(username, homefeed) {
        return this.homefeedService.create(homefeed, username);
    }
    update(id, homefeed) {
        return this.homefeedService.update(id, homefeed);
    }
    remove(id) {
        return this.homefeedService.remove(id);
    }
};
exports.HomefeedController = HomefeedController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "getHomeFeed", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, homefeed_entity_1.Homefeed]),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, homefeed_entity_1.Homefeed]),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HomefeedController.prototype, "remove", null);
exports.HomefeedController = HomefeedController = __decorate([
    (0, common_1.Controller)('homefeed'),
    __metadata("design:paramtypes", [homefeed_service_1.HomefeedService])
], HomefeedController);
//# sourceMappingURL=homefeed.controller.js.map