"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./notification.entity");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const organization_entity_1 = require("../organization/organization.entity");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                notification_entity_1.Notification,
                profileuser_entity_1.ProfileUser,
                homefeed_entity_1.Homefeed,
                organization_entity_1.Organization,
                organization_member_entity_1.OrganizationMember,
                layer_member_entity_1.LayerMember,
            ]),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map