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
exports.InboxController = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("../activity/activity.service");
const actor_service_1 = require("./actor.service");
let InboxController = class InboxController {
    constructor(activityService, actorService) {
        this.activityService = activityService;
        this.actorService = actorService;
    }
    async receiveActivity(username, activity) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        console.log(`Received activity for ${username}:`, activity);
        if (!activity.type) {
            throw new common_1.BadRequestException('Activity type is required');
        }
        const result = await this.activityService.createActivity(activity.type, actor.id, activity);
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'Accept',
            actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${username}`,
            object: activity,
            result: 'Activity processed successfully',
        };
    }
    async sendActivities(username) {
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        const activities = await this.activityService.getActivitiesForActor(actor.id);
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            type: 'OrderedCollection',
            totalItems: activities.length,
            orderedItems: activities.map((activity) => ({
                id: `https://d3kv9nj5wp3sq6.cloudfront.net/activities/${activity.id}`,
                type: activity.type,
                actor: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${username}`,
                object: activity.object,
            })),
        };
    }
};
exports.InboxController = InboxController;
__decorate([
    (0, common_1.Post)('inbox'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "receiveActivity", null);
__decorate([
    (0, common_1.Get)('outbox'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InboxController.prototype, "sendActivities", null);
exports.InboxController = InboxController = __decorate([
    (0, common_1.Controller)('actors/:username'),
    __metadata("design:paramtypes", [activity_service_1.ActivityService,
        actor_service_1.ActorService])
], InboxController);
//# sourceMappingURL=inbox.controller.js.map