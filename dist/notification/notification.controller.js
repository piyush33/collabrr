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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getOrgUserNotifications(orgId, username) {
        return this.notificationService.getOrgUserNotifications(orgId, username);
    }
    async getLayerUserNotifications(layerId, username) {
        return this.notificationService.getLayerUserNotifications(layerId, username);
    }
    unreadCount(orgId, username) {
        return this.notificationService
            .getUnreadCount(+orgId, username)
            .then((n) => ({ count: n }));
    }
    markAllRead(orgId, username) {
        return this.notificationService
            .markAllRead(+orgId, username)
            .then(() => ({ ok: true }));
    }
    markOneRead(orgId, id, username) {
        return this.notificationService
            .markOneRead(+orgId, username, +id)
            .then(() => ({ ok: true }));
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)('orgs/:orgId/notifications/user/:username'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getOrgUserNotifications", null);
__decorate([
    (0, common_1.Get)('layers/:layerId/notifications/user/:username'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getLayerUserNotifications", null);
__decorate([
    (0, common_1.Get)('orgs/:orgId/notifications/user/:username/unread-count'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Post)('orgs/:orgId/notifications/user/:username/mark-all-read'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Post)('orgs/:orgId/notifications/:id/mark-read/:username'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "markOneRead", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map