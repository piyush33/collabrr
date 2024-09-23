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
exports.WebFingerController = void 0;
const common_1 = require("@nestjs/common");
const actor_service_1 = require("./actor.service");
let WebFingerController = class WebFingerController {
    constructor(actorService) {
        this.actorService = actorService;
    }
    async handleWebFinger(resource) {
        if (!resource) {
            throw new Error('No resource provided');
        }
        const match = resource.match(/^acct:(.+)@social.opinionth.com$/);
        if (!match) {
            throw new Error('Invalid WebFinger resource');
        }
        const username = match[1];
        const actor = await this.actorService.findByUsername(username);
        if (!actor) {
            throw new Error('Actor not found');
        }
        return {
            subject: `acct:${actor.preferredUsername}@social.opinionth.com`,
            links: [
                {
                    rel: 'self',
                    type: 'application/activity+json',
                    href: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                },
            ],
        };
    }
};
exports.WebFingerController = WebFingerController;
__decorate([
    (0, common_1.Get)('webfinger'),
    __param(0, (0, common_1.Query)('resource')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebFingerController.prototype, "handleWebFinger", null);
exports.WebFingerController = WebFingerController = __decorate([
    (0, common_1.Controller)('.well-known'),
    __metadata("design:paramtypes", [actor_service_1.ActorService])
], WebFingerController);
//# sourceMappingURL=webfinger.controller.js.map