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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_job_entity_1 = require("./ai-job.entity");
const layer_summary_entity_1 = require("../layer-summary.entity");
const layer_summary_service_1 = require("../layer-summary.service");
const homefeed_service_1 = require("../homefeed.service");
const ai_prompts_1 = require("./ai-prompts");
const gemini_1 = require("./gemini");
const STALE_MS = 2 * 60 * 1000;
const SIGNATURE_RE = /^[a-f0-9]{64}$/;
let AiService = class AiService {
    constructor(jobs, results, summaries, homefeed) {
        this.jobs = jobs;
        this.results = results;
        this.summaries = summaries;
        this.homefeed = homefeed;
        this.running = new Set();
    }
    kindOf(kind) {
        if (!ai_prompts_1.AI_KINDS.includes(kind))
            throw new common_1.BadRequestException('Unknown AI feature');
        return kind;
    }
    savedResult(layerId, signature) {
        return this.results.findOne({
            where: { layer: { id: layerId }, signature },
        });
    }
    findJob(layerId, kind, signature) {
        return this.jobs.findOne({
            where: { layer: { id: layerId }, kind, signature },
        });
    }
    isLive(job, key) {
        if (!job || job.status !== 'pending')
            return false;
        return (this.running.has(key) ||
            Date.now() - new Date(job.updatedAt).getTime() < STALE_MS);
    }
    async start(orgId, layerId, username, kindParam, body) {
        const kind = this.kindOf(kindParam);
        await this.homefeed.assertLayerAccess(orgId, username, layerId);
        const { apiKey, model } = (0, gemini_1.geminiConfig)();
        if (!apiKey)
            throw new common_1.ServiceUnavailableException('AI is not configured.');
        let prepared;
        try {
            prepared = (0, ai_prompts_1.prepare)(kind, model, body ?? {});
        }
        catch (e) {
            if (e instanceof ai_prompts_1.InputError)
                throw new common_1.BadRequestException(e.message);
            throw e;
        }
        const { signature } = prepared;
        const key = `${layerId}:${kind}:${signature}`;
        if (!body?.force) {
            const saved = await this.savedResult(layerId, signature);
            if (saved)
                return { status: 'done', signature, result: saved.summary };
        }
        const job = await this.findJob(layerId, kind, signature);
        if (this.isLive(job, key))
            return { status: 'pending', signature };
        await this.jobs.upsert({
            layer: { id: layerId },
            kind,
            signature,
            status: 'pending',
            error: null,
        }, { conflictPaths: ['layer', 'kind', 'signature'] });
        await this.jobs.update({ layer: { id: layerId }, kind, signature }, { updatedAt: new Date() });
        this.running.add(key);
        void this.run(orgId, layerId, username, prepared, apiKey, model).finally(() => this.running.delete(key));
        return { status: 'pending', signature };
    }
    async status(orgId, layerId, username, kindParam, signature) {
        const kind = this.kindOf(kindParam);
        if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature))
            throw new common_1.BadRequestException('Invalid signature');
        await this.homefeed.assertLayerAccess(orgId, username, layerId);
        const job = await this.findJob(layerId, kind, signature);
        const key = `${layerId}:${kind}:${signature}`;
        if (this.isLive(job, key))
            return { status: 'pending', signature };
        const saved = await this.savedResult(layerId, signature);
        if (saved)
            return { status: 'done', signature, result: saved.summary };
        if (job?.status === 'error')
            return {
                status: 'error',
                signature,
                error: job.error || 'Generation failed.',
            };
        if (job?.status === 'pending')
            return {
                status: 'error',
                signature,
                error: 'Generation was interrupted.',
            };
        return { status: 'missing', signature };
    }
    async run(orgId, layerId, username, p, apiKey, model) {
        const where = {
            layer: { id: layerId },
            kind: p.kind,
            signature: p.signature,
        };
        const started = Date.now();
        try {
            const result = await (0, ai_prompts_1.generate)(p, apiKey, model);
            if (result) {
                await this.summaries.save(orgId, layerId, username, {
                    signature: p.signature,
                    model,
                    summary: result,
                });
                await this.jobs.update(where, { status: 'done', error: null });
            }
            else {
                await this.jobs.update(where, {
                    status: 'error',
                    error: 'No suggestions came back. Try again.',
                });
            }
            console.log(`[ai] ${p.kind} layer=${layerId} cards=${p.compact.length} ${Date.now() - started}ms`);
        }
        catch (e) {
            console.error(`[ai] ${p.kind} layer=${layerId} failed`, e);
            const message = e instanceof gemini_1.AiError ? e.message : 'Generation failed. Try again.';
            await this.jobs
                .update(where, { status: 'error', error: message })
                .catch((err) => console.error('[ai] could not record failure', err));
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_job_entity_1.AiJob)),
    __param(1, (0, typeorm_1.InjectRepository)(layer_summary_entity_1.LayerSummary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        layer_summary_service_1.LayerSummaryService,
        homefeed_service_1.HomefeedService])
], AiService);
//# sourceMappingURL=ai.service.js.map