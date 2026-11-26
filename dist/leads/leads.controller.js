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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const design_partner_request_entity_1 = require("./design-partner-request.entity");
const TEAM_SIZES = ['<20', '20-50', '51-200', '200+'];
const TIME_ZONES = ['1', '2', '3+'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const text = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
let LeadsController = class LeadsController {
    constructor(requests) {
        this.requests = requests;
        this.hits = new Map();
    }
    limited(ip) {
        const now = Date.now();
        const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
        recent.push(now);
        this.hits.set(ip, recent);
        if (this.hits.size > 5000)
            this.hits.clear();
        return recent.length > MAX_PER_WINDOW;
    }
    async create(body, req) {
        const ip = String(req?.headers?.['x-forwarded-for'] ?? '')
            .split(',')[0]
            .trim() ||
            req?.ip ||
            'unknown';
        if (this.limited(ip))
            throw new common_1.HttpException('Too many requests. Try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        if (text(body?.website, 200))
            return { ok: true };
        const name = text(body?.name, 120);
        const email = text(body?.email, 200).toLowerCase();
        const company = text(body?.company, 160);
        const teamSize = text(body?.teamSize, 20);
        const timeZones = text(body?.timeZones, 20);
        if (!name)
            throw new common_1.BadRequestException('Add your name.');
        if (!EMAIL_RE.test(email))
            throw new common_1.BadRequestException('Add a valid work email.');
        if (!company)
            throw new common_1.BadRequestException('Add your company.');
        if (!TEAM_SIZES.includes(teamSize))
            throw new common_1.BadRequestException('Pick a team size.');
        if (!TIME_ZONES.includes(timeZones))
            throw new common_1.BadRequestException('Pick how many time zones you span.');
        await this.requests.save(this.requests.create({
            name,
            email,
            company,
            teamSize,
            timeZones,
            role: text(body?.role, 80) || null,
            decision: text(body?.decision, 2000) || null,
            source: text(body?.source, 80) || null,
        }));
        return { ok: true };
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.Controller)('public/design-partners'),
    __param(0, (0, typeorm_1.InjectRepository)(design_partner_request_entity_1.DesignPartnerRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map