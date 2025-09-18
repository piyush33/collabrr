"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const like_entity_1 = require("./like.entity");
const like_service_1 = require("./like.service");
const like_controller_1 = require("./like.controller");
const profileuser_entity_1 = require("../profileusers/profileuser.entity");
const profilefeed_item_entity_1 = require("../profilefeed/profilefeed-item.entity");
const homefeed_entity_1 = require("../homefeed/homefeed.entity");
const notification_entity_1 = require("../notification/notification.entity");
const notification_module_1 = require("../notification/notification.module");
let LikeModule = class LikeModule {
};
exports.LikeModule = LikeModule;
exports.LikeModule = LikeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                like_entity_1.Like,
                profileuser_entity_1.ProfileUser,
                profilefeed_item_entity_1.ProfileFeedItem,
                homefeed_entity_1.Homefeed,
                notification_entity_1.Notification,
            ]),
            notification_module_1.NotificationModule,
        ],
        providers: [like_service_1.LikeService],
        controllers: [like_controller_1.LikeController],
    })
], LikeModule);
//# sourceMappingURL=like.module.js.map