"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileusersModule = void 0;
const common_1 = require("@nestjs/common");
const profileusers_service_1 = require("./profileusers.service");
const profileusers_controller_1 = require("./profileusers.controller");
const typeorm_1 = require("@nestjs/typeorm");
const profileuser_entity_1 = require("./profileuser.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const follower_entity_1 = require("./follower.entity");
const follower_entity_2 = require("./follower.entity");
const organization_member_entity_1 = require("../organization/organization-member.entity");
const organization_entity_1 = require("../organization/organization.entity");
let ProfileusersModule = class ProfileusersModule {
};
exports.ProfileusersModule = ProfileusersModule;
exports.ProfileusersModule = ProfileusersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                profileuser_entity_1.ProfileUser,
                profilefeed_item_entity_1.ProfileFeedItem,
                follower_entity_1.Follower,
                follower_entity_2.Following,
                organization_member_entity_1.OrganizationMember,
                organization_entity_1.Organization,
            ]),
        ],
        providers: [profileusers_service_1.ProfileusersService],
        controllers: [profileusers_controller_1.ProfileusersController],
        exports: [profileusers_service_1.ProfileusersService],
    })
], ProfileusersModule);
//# sourceMappingURL=profileusers.module.js.map