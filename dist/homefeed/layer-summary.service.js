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
exports.LayerSummaryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const layer_summary_entity_1 = require("./layer-summary.entity");
const homefeed_service_1 = require("./homefeed.service");
const SIGNATURE_RE = /^[a-f0-9]{64}$/;
const MAX_SUMMARY_BYTES = 64 * 1024;
const KEEP_PER_LAYER = 10;
let LayerSummaryService = class LayerSummaryService {
    constructor(repo, homefeedService) {
        this.repo = repo;
        this.homefeedService = homefeedService;
    }
    assertSignature(signature) {
        if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature)) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        return signature;
    }
    async get(orgId, layerId, username, signature) {
        const sig = this.assertSignature(signature);
        await this.homefeedService.assertLayerAccess(orgId, username, layerId);
        const row = await this.repo.findOne({
            where: { layer: { id: layerId }, signature: sig },
        });
        return {
            summary: row?.summary ?? null,
            savedAt: row?.updatedAt ?? null,
        };
    }
    async save(orgId, layerId, username, body) {
        const sig = this.assertSignature(body?.signature);
        const summary = body?.summary;
        if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
            throw new common_1.BadRequestException('Invalid summary');
        }
        if (Buffer.byteLength(JSON.stringify(summary)) > MAX_SUMMARY_BYTES) {
            throw new common_1.BadRequestException('Summary too large');
        }
        const model = typeof body.model === 'string' ? body.model.slice(0, 80) : null;
        await this.homefeedService.assertLayerAccess(orgId, username, layerId);
        await this.repo.upsert({
            layer: { id: layerId },
            signature: sig,
            model,
            summary: summary,
        }, { conflictPaths: ['layer', 'signature'] });
        const { tableName } = this.repo.metadata;
        await this.repo.query(`DELETE FROM "${tableName}" WHERE "layerId" = $1 AND id NOT IN (
         SELECT id FROM "${tableName}" WHERE "layerId" = $1
         ORDER BY "updatedAt" DESC LIMIT $2)`, [layerId, KEEP_PER_LAYER]);
        return { ok: true };
    }
};
exports.LayerSummaryService = LayerSummaryService;
exports.LayerSummaryService = LayerSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(layer_summary_entity_1.LayerSummary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        homefeed_service_1.HomefeedService])
], LayerSummaryService);
//# sourceMappingURL=layer-summary.service.js.map