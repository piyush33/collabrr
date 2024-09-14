"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const actor_entity_1 = require("./actor.entity");
const actor_service_1 = require("./actor.service");
const actor_controller_1 = require("./actor.controller");
const inbox_controller_1 = require("./inbox.controller");
const activity_service_1 = require("../activity/activity.service");
const activity_entity_1 = require("../activity/activity.entity");
const signature_validation_middleware_1 = require("./signature-validation.middleware");
const webfinger_controller_1 = require("./webfinger.controller");
let ActorModule = class ActorModule {
    configure(consumer) {
        consumer
            .apply(signature_validation_middleware_1.SignatureValidationMiddleware)
            .forRoutes({ path: 'actors/:username/inbox', method: common_1.RequestMethod.POST }, { path: 'actors/:username', method: common_1.RequestMethod.GET });
    }
};
exports.ActorModule = ActorModule;
exports.ActorModule = ActorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([actor_entity_1.Actor, activity_entity_1.Activity])],
        controllers: [actor_controller_1.ActorController, inbox_controller_1.InboxController, webfinger_controller_1.WebFingerController],
        providers: [actor_service_1.ActorService, activity_service_1.ActivityService],
        exports: [actor_service_1.ActorService],
    })
], ActorModule);
//# sourceMappingURL=actor.module.js.map