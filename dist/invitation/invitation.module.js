"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const invitation_controller_1 = require("./invitation.controller");
const invitation_service_1 = require("./invitation.service");
const invitation_entity_1 = require("./invitation.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const resend_1 = require("resend");
let InvitationModule = class InvitationModule {
};
exports.InvitationModule = InvitationModule;
exports.InvitationModule = InvitationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                invitation_entity_1.Invitation,
                organization_entity_1.Organization,
                organization_member_entity_1.OrganizationMember,
                linked_card_layer_entity_1.LinkedCardLayer,
                layer_member_entity_1.LayerMember,
                profileuser_entity_1.ProfileUser,
            ]),
        ],
        controllers: [invitation_controller_1.InvitationController],
        providers: [
            invitation_service_1.InvitationService,
            {
                provide: 'RESEND_CLIENT',
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const key = cfg.get('RESEND_API_KEY');
                    return key ? new resend_1.Resend(key) : null;
                },
            },
        ],
        exports: [invitation_service_1.InvitationService],
    })
], InvitationModule);
//# sourceMappingURL=invitation.module.js.map