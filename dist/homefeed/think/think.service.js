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
exports.ThinkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const homefeed_service_1 = require("../homefeed.service");
const gemini_1 = require("../ai/gemini");
const think_entities_1 = require("./think.entities");
const converge_service_1 = require("./converge.service");
const think_prompts_1 = require("./think-prompts");
const STALE_MS = 3 * 60 * 1000;
const KEEP_MS = 24 * 3600 * 1000;
const KINDS = [
    'chat-card',
    'chat-space',
    'chat-wide',
    'to-card',
    'decide',
    'call-outcome',
    'converge-read',
];
const LAYER_KINDS = [
    'chat-card',
    'chat-space',
    'decide',
    'call-outcome',
    'converge-read',
];
let ThinkService = class ThinkService {
    constructor(tasks, homefeed, convergeState) {
        this.tasks = tasks;
        this.homefeed = homefeed;
        this.convergeState = convergeState;
    }
    async start(orgId, username, kindIn, body) {
        if (!KINDS.includes(kindIn))
            throw new common_1.BadRequestException('Unknown AI feature');
        const kind = kindIn;
        if (!body || typeof body !== 'object')
            throw new common_1.BadRequestException('Missing body');
        if (!Array.isArray(body.cards))
            body.cards = [];
        const layerId = body.layerId != null ? Number(body.layerId) : null;
        if (LAYER_KINDS.includes(kind) && !Number.isInteger(layerId))
            throw new common_1.BadRequestException('layerId is required');
        if (layerId != null && Number.isInteger(layerId))
            await this.homefeed.assertLayerAccess(orgId, username, layerId);
        else
            await this.homefeed.assertMember(orgId, username);
        const task = await this.tasks.save({
            id: (0, crypto_1.randomUUID)(),
            orgId,
            layerId,
            username,
            kind,
            status: 'pending',
            result: null,
            error: null,
        });
        void this.run(task.id, kind, layerId, body);
        void this.tasks
            .delete({ updatedAt: (0, typeorm_2.LessThan)(new Date(Date.now() - KEEP_MS)) })
            .catch(() => undefined);
        return { id: task.id, status: 'pending' };
    }
    async run(id, kind, layerId, body) {
        try {
            let result;
            switch (kind) {
                case 'chat-card':
                    result = await (0, think_prompts_1.chatCard)(body);
                    break;
                case 'chat-space':
                    result = await (0, think_prompts_1.chatSpace)(body);
                    break;
                case 'chat-wide':
                    result = await (0, think_prompts_1.chatWide)(body);
                    break;
                case 'to-card':
                    result = await (0, think_prompts_1.toCard)(body);
                    break;
                case 'decide':
                    result = await (0, think_prompts_1.decide)(body);
                    break;
                case 'call-outcome':
                    if (!String(body.notes ?? '').trim())
                        throw new gemini_1.AiError('Add some notes from the call first.');
                    result = await (0, think_prompts_1.callOutcome)(body);
                    break;
                case 'converge-read': {
                    const mode = body.mode === 'fresh' ? 'fresh' : 'update';
                    const convergedIds = Array.isArray(body.convergedIds)
                        ? body.convergedIds.map(String)
                        : [];
                    const previous = await this.convergeState.previousFor(layerId, mode, convergedIds);
                    const { points } = (await (0, think_prompts_1.converge)({ ...body, previous }));
                    result = await this.convergeState.applyReading(layerId, mode, points ?? [], String(body.signature ?? ''), convergedIds);
                    break;
                }
            }
            await this.tasks.update(id, {
                status: 'done',
                result: result,
            });
        }
        catch (e) {
            console.error(`[think:${kind}]`, e);
            await this.tasks.update(id, {
                status: 'error',
                error: e instanceof gemini_1.AiError ? e.message : 'The AI request failed.',
            });
        }
    }
    async get(orgId, username, id) {
        const task = await this.tasks.findOne({ where: { id, orgId, username } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status === 'pending' &&
            Date.now() - new Date(task.updatedAt).getTime() > STALE_MS)
            return {
                id,
                status: 'error',
                error: 'The AI request timed out. Try again.',
            };
        return { id, status: task.status, result: task.result, error: task.error };
    }
};
exports.ThinkService = ThinkService;
exports.ThinkService = ThinkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(think_entities_1.ThinkTask)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        homefeed_service_1.HomefeedService,
        converge_service_1.ConvergeService])
], ThinkService);
//# sourceMappingURL=think.service.js.map