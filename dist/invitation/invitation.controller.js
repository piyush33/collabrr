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
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const invitation_service_1 = require("./invitation.service");
const invitation_dtos_1 = require("./invitation.dtos");
let InvitationController = class InvitationController {
    constructor(service) {
        this.service = service;
    }
    createOrgInvite(orgId, inviterId, dto) {
        return this.service.createOrgInvite(orgId, inviterId, dto);
    }
    listOrgInvites(orgId) {
        return this.service.listOrgInvites(orgId);
    }
    createLayerInvite(layerId, inviterId, dto) {
        return this.service.createLayerInvite(layerId, inviterId, dto);
    }
    listLayerInvites(layerId) {
        return this.service.listLayerInvites(layerId);
    }
    revoke(id, requesterId) {
        return this.service.revoke(id, requesterId);
    }
    resend(id, requesterId, hours) {
        const h = Number(hours || 168) || 168;
        return this.service.resend(id, requesterId, h);
    }
    preview(token) {
        return this.service.previewByToken(token);
    }
    accept(body, acceptorId) {
        return this.service.accept(body.token, acceptorId);
    }
};
exports.InvitationController = InvitationController;
__decorate([
    (0, common_1.Post)('orgs/:orgId/invites'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('inviterId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, invitation_dtos_1.CreateOrgInviteDto]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "createOrgInvite", null);
__decorate([
    (0, common_1.Get)('orgs/:orgId/invites'),
    __param(0, (0, common_1.Param)('orgId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "listOrgInvites", null);
__decorate([
    (0, common_1.Post)('layers/:layerId/invites'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('inviterId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, invitation_dtos_1.CreateLayerInviteDto]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "createLayerInvite", null);
__decorate([
    (0, common_1.Get)('layers/:layerId/invites'),
    __param(0, (0, common_1.Param)('layerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "listLayerInvites", null);
__decorate([
    (0, common_1.Post)('invites/:id/revoke'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('requesterId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)('invites/:id/resend'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('requesterId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "resend", null);
__decorate([
    (0, common_1.Get)('invites/preview'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('invites/accept'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('acceptorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dtos_1.AcceptInviteDto, Number]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "accept", null);
exports.InvitationController = InvitationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService])
], InvitationController);
//# sourceMappingURL=invitation.controller.js.map