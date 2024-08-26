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
const homefeed_service_1 = require("./homefeed.service");
const homefeed_controller_1 = require("./homefeed.controller");
const user_interaction_entity_1 = require("./user-interaction.entity");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
let HomefeedModule = class HomefeedModule {
};
exports.HomefeedModule = HomefeedModule;
exports.HomefeedModule = HomefeedModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([homefeed_entity_1.Homefeed, user_interaction_entity_1.UserInteraction, profileuser_entity_1.ProfileUser])],
        providers: [homefeed_service_1.HomefeedService],
        controllers: [homefeed_controller_1.HomefeedController],
    })
], HomefeedModule);
//# sourceMappingURL=homefeed.module.js.map