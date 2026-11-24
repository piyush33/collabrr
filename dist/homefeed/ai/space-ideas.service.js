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
exports.SpaceIdeasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const org_ai_result_entity_1 = require("./org-ai-result.entity");
const layer_summary_entity_1 = require("../layer-summary.entity");
const homefeed_service_1 = require("../homefeed.service");
const gemini_1 = require("./gemini");
const space_ideas_1 = require("./space-ideas");
const ai_prompts_1 = require("./ai-prompts");
const MAX_FEED = 500;
const STALE_MS = 3 * 60 * 1000;
const KEEP_PER_SCOPE = 5;
const SIGNATURE_RE = /^[a-f0-9]{64}$/;
let SpaceIdeasService = class SpaceIdeasService {
    constructor(rows, summaries, homefeed) {
        this.rows = rows;
        this.summaries = summaries;
        this.homefeed = homefeed;
        this.running = new Set();
    }
    scopeOf(raw) {
        const id = typeof raw === 'string' ? (0, space_ideas_1.normalizeCategory)(raw) : '';
        if (!id || id === 'all' || id.length > 120)
            throw new common_1.BadRequestException('Pick a category first.');
        return id;
    }
    find(orgId, scope, signature) {
        return this.rows.findOne({
            where: {
                organization: { id: orgId },
                kind: space_ideas_1.SPACE_IDEAS_KIND,
                scope,
                signature,
            },
        });
    }
    isLive(row, key) {
        if (!row || row.status !== 'pending')
            return false;
        return (this.running.has(key) ||
            Date.now() - new Date(row.updatedAt).getTime() < STALE_MS);
    }
    async topics(layerIds) {
        const map = new Map();
        if (!layerIds.length)
            return map;
        const { tableName } = this.summaries.metadata;
        const rows = await this.summaries.query(`SELECT DISTINCT ON ("layerId") "layerId", summary->>'topic' AS topic, summary->>'tagline' AS tagline
           FROM "${tableName}"
          WHERE "layerId" = ANY($1) AND summary ? 'topic'
          ORDER BY "layerId", "updatedAt" DESC`, [layerIds]);
        rows.forEach((r) => map.set(Number(r.layerId), { topic: r.topic, tagline: r.tagline }));
        return map;
    }
    async start(orgId, username, body) {
        const scope = this.scopeOf(body?.category);
        const target = {
            id: scope,
            name: (0, ai_prompts_1.clip)(body?.categoryName, 80) || scope,
            description: (0, ai_prompts_1.clip)(body?.categoryDescription, 200) || undefined,
        };
        const { apiKey, model } = (0, gemini_1.geminiConfig)();
        if (!apiKey)
            throw new common_1.ServiceUnavailableException('AI is not configured.');
        const cards = await this.homefeed.getHomeFeed(orgId, username, MAX_FEED, {
            onlyLayered: true,
        });
        const layerIds = [
            ...new Set(cards.map((c) => c.layer?.id).filter(Boolean)),
        ];
        let prepared;
        try {
            prepared = (0, space_ideas_1.prepareIdeas)(model, target, cards, await this.topics(layerIds));
        }
        catch (e) {
            if (e instanceof space_ideas_1.IdeasInputError)
                throw new common_1.BadRequestException(e.message);
            throw e;
        }
        const { signature } = prepared;
        const key = `${orgId}:${scope}:${signature}`;
        const row = await this.find(orgId, scope, signature);
        if (!body?.force && row?.status === 'done' && row.result)
            return { status: 'done', signature, result: row.result };
        if (this.isLive(row, key))
            return { status: 'pending', signature };
        await this.rows.upsert({
            organization: { id: orgId },
            kind: space_ideas_1.SPACE_IDEAS_KIND,
            scope,
            signature,
            status: 'pending',
            error: null,
            ...(row?.result ? {} : { result: null }),
            model,
        }, { conflictPaths: ['organization', 'kind', 'scope', 'signature'] });
        await this.rows.update({ organization: { id: orgId }, kind: space_ideas_1.SPACE_IDEAS_KIND, scope, signature }, { updatedAt: new Date() });
        this.running.add(key);
        void this.run(orgId, scope, prepared, apiKey, model).finally(() => this.running.delete(key));
        return { status: 'pending', signature };
    }
    async status(orgId, username, category, signature) {
        const scope = this.scopeOf(category);
        if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature))
            throw new common_1.BadRequestException('Invalid signature');
        await this.homefeed.assertMember(orgId, username);
        const row = await this.find(orgId, scope, signature);
        const key = `${orgId}:${scope}:${signature}`;
        if (this.isLive(row, key))
            return { status: 'pending', signature };
        if (row?.status === 'done' && row.result)
            return { status: 'done', signature, result: row.result };
        if (row?.status === 'error')
            return {
                status: 'error',
                signature,
                error: row.error || 'Generation failed.',
            };
        if (row?.status === 'pending')
            return {
                status: 'error',
                signature,
                error: 'Generation was interrupted.',
            };
        return { status: 'missing', signature };
    }
    async run(orgId, scope, p, apiKey, model) {
        const where = {
            organization: { id: orgId },
            kind: space_ideas_1.SPACE_IDEAS_KIND,
            scope,
            signature: p.signature,
        };
        const started = Date.now();
        try {
            const result = await (0, space_ideas_1.runIdeas)(p, apiKey, model);
            if (result.ideas.length) {
                await this.rows.update(where, { status: 'done', error: null, result });
                await this.prune(orgId, scope);
            }
            else {
                await this.rows.update(where, {
                    status: 'error',
                    error: 'No space ideas came back. Try again.',
                });
            }
            console.log(`[ai] ${space_ideas_1.SPACE_IDEAS_KIND} org=${orgId} scope=${scope} spaces=${p.spaces.length} cards=${p.cardCount} ${Date.now() - started}ms`);
        }
        catch (e) {
            console.error(`[ai] ${space_ideas_1.SPACE_IDEAS_KIND} org=${orgId} failed`, e);
            const message = e instanceof gemini_1.AiError ? e.message : 'Generation failed. Try again.';
            await this.rows
                .update(where, { status: 'error', error: message })
                .catch((err) => console.error('[ai] could not record failure', err));
        }
    }
    async prune(orgId, scope) {
        const { tableName } = this.rows.metadata;
        await this.rows
            .query(`DELETE FROM "${tableName}"
          WHERE "organizationId" = $1 AND kind = $2 AND scope = $3 AND status <> 'pending'
            AND id NOT IN (
              SELECT id FROM "${tableName}"
               WHERE "organizationId" = $1 AND kind = $2 AND scope = $3 AND status <> 'pending'
               ORDER BY "updatedAt" DESC LIMIT $4)`, [orgId, space_ideas_1.SPACE_IDEAS_KIND, scope, KEEP_PER_SCOPE])
            .catch((e) => console.error('[ai] prune failed', e));
    }
};
exports.SpaceIdeasService = SpaceIdeasService;
exports.SpaceIdeasService = SpaceIdeasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(org_ai_result_entity_1.OrgAiResult)),
    __param(1, (0, typeorm_1.InjectRepository)(layer_summary_entity_1.LayerSummary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        homefeed_service_1.HomefeedService])
], SpaceIdeasService);
//# sourceMappingURL=space-ideas.service.js.map