"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomefeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const homefeed_entity_1 = require("./homefeed.entity");
const user_interaction_entity_1 = require("./user-interaction.entity");
const homefeed_service_1 = require("./homefeed.service");
const homefeed_controller_1 = require("./homefeed.controller");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const team_entity_1 = require("../organization/team.entity");
const team_member_entity_1 = require("../organization/team-member.entity");
const team_card_access_entity_1 = require("../organization/team-card-access.entity");
const linked_card_layer_entity_1 = require("./linked-card-layer.entity");
const layer_member_entity_1 = require("./layer-member.entity");
const layer_summary_entity_1 = require("./layer-summary.entity");
const layer_summary_service_1 = require("./layer-summary.service");
const layer_summary_controller_1 = require("./layer-summary.controller");
const ai_job_entity_1 = require("./ai/ai-job.entity");
const ai_service_1 = require("./ai/ai.service");
const ai_controller_1 = require("./ai/ai.controller");
const notification_module_1 = require("../notification/notification.module");
let HomefeedModule = class HomefeedModule {
};
exports.HomefeedModule = HomefeedModule;
exports.HomefeedModule = HomefeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                homefeed_entity_1.Homefeed,
                user_interaction_entity_1.UserInteraction,
                profileuser_entity_1.ProfileUser,
                organization_entity_1.Organization,
                organization_member_entity_1.OrganizationMember,
                team_entity_1.Team,
                team_member_entity_1.TeamMember,
                team_card_access_entity_1.TeamCardAccess,
                linked_card_layer_entity_1.LinkedCardLayer,
                layer_member_entity_1.LayerMember,
                layer_summary_entity_1.LayerSummary,
                ai_job_entity_1.AiJob,
            ]),
            notification_module_1.NotificationModule,
        ],
        controllers: [homefeed_controller_1.HomefeedController, layer_summary_controller_1.LayerSummaryController, ai_controller_1.AiController],
        providers: [homefeed_service_1.HomefeedService, layer_summary_service_1.LayerSummaryService, ai_service_1.AiService],
        exports: [homefeed_service_1.HomefeedService],
    })
], HomefeedModule);
//# sourceMappingURL=homefeed.module.js.map