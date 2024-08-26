"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
;
const save_service_1 = require("./save.service");
const save_controller_1 = require("./save.controller");
const save_entity_1 = require("./save.entity");
let SaveModule = class SaveModule {
};
exports.SaveModule = SaveModule;
exports.SaveModule = SaveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([save_entity_1.Save, profileuser_entity_1.ProfileUser, profilefeed_item_entity_1.ProfileFeedItem, homefeed_entity_1.Homefeed]),
        ],
        providers: [save_service_1.SaveService],
        controllers: [save_controller_1.SaveController]
    })
], SaveModule);
//# sourceMappingURL=save.module.js.map