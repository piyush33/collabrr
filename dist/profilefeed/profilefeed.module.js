"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileFeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const profilefeed_service_1 = require("./profilefeed.service");
const profilefeed_controller_1 = require("./profilefeed.controller");
const profilefeed_item_entity_1 = require("./profilefeed-item.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const organization_entity_1 = require("../organization/organization.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const linked_card_layer_entity_1 = require("../homefeed/linked-card-layer.entity");
const layer_member_entity_1 = require("../homefeed/layer-member.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
let ProfileFeedModule = class ProfileFeedModule {
};
exports.ProfileFeedModule = ProfileFeedModule;
exports.ProfileFeedModule = ProfileFeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                profilefeed_item_entity_1.ProfileFeedItem,
                profileuser_entity_1.ProfileUser,
                organization_entity_1.Organization,
                organization_member_entity_1.OrganizationMember,
                linked_card_layer_entity_1.LinkedCardLayer,
                layer_member_entity_1.LayerMember,
                homefeed_entity_1.Homefeed,
            ]),
        ],
        providers: [profilefeed_service_1.ProfileFeedService],
        controllers: [profilefeed_controller_1.ProfileFeedController],
    })
], ProfileFeedModule);
//# sourceMappingURL=profilefeed.module.js.map