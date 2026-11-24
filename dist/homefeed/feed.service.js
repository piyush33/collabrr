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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const homefeed_entity_1 = require("./homefeed.entity");
const homefeed_service_1 = require("./homefeed.service");
const category_1 = require("./category");
const content_metadata_enum_1 = require("../common/enums/content-metadata.enum");
const DEFAULT_PAGE = 30;
const MAX_PAGE = 100;
const PHASES = new Set(Object.values(content_metadata_enum_1.Phase));
const ROLES = new Set(Object.values(content_metadata_enum_1.RoleType));
const list = (s) => (s ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const date = (s) => {
    if (!s)
        return undefined;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? undefined : d;
};
let FeedService = class FeedService {
    constructor(homefeed, cards) {
        this.homefeed = homefeed;
        this.cards = cards;
    }
    async rawCategories(orgId, id) {
        const rows = await this.cards
            .createQueryBuilder('h')
            .select('DISTINCT h.category', 'category')
            .where('h.organizationId = :orgId', { orgId })
            .getRawMany();
        return rows
            .map((r) => r.category)
            .filter((c) => (0, category_1.normalizeCategory)(c) === id);
    }
    async page(orgId, username, f) {
        const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
        const limit = Math.min(Math.max(Number(f.limit) || DEFAULT_PAGE, 1), MAX_PAGE);
        const category = (f.category ?? '').trim();
        if (category && category !== 'all') {
            const raws = await this.rawCategories(orgId, (0, category_1.normalizeCategory)(category));
            const named = raws.filter((r) => r != null);
            const withNull = raws.some((r) => r == null);
            if (!named.length && !withNull)
                return { items: [], nextCursor: null, total: f.cursor ? null : 0 };
            qb.andWhere(named.length && withNull
                ? '(h.category IN (:...cats) OR h.category IS NULL)'
                : named.length
                    ? 'h.category IN (:...cats)'
                    : 'h.category IS NULL', { cats: named });
        }
        const phases = list(f.phases).filter((p) => PHASES.has(p));
        if (phases.length)
            qb.andWhere('h.phase IN (:...phases)', { phases });
        const roles = list(f.roles).filter((r) => ROLES.has(r));
        if (roles.length)
            qb.andWhere('h."roleTypes" && ARRAY[:...roles]::role_type_enum[]', {
                roles,
            });
        const q = (f.q ?? '').trim().slice(0, 200);
        if (q) {
            const like = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
            qb.andWhere('(h.title ILIKE :like OR h.description ILIKE :like OR h.text ILIKE :like OR h.username ILIKE :like)', { like });
        }
        const from = date(f.from);
        if (from)
            qb.andWhere('h.createdAt >= :from', { from });
        const to = date(f.to);
        if (to)
            qb.andWhere('h.createdAt <= :to', { to });
        if (f.content === 'images')
            qb.andWhere("COALESCE(h.image, '') <> ''");
        else if (f.content === 'text')
            qb.andWhere("COALESCE(h.text, '') <> '' AND COALESCE(h.image, '') = ''");
        else if (f.content === 'links')
            qb.andWhere("COALESCE(h.weblink, '') <> ''");
        if (f.author)
            qb.andWhere('h.username = :author', { author: f.author });
        const total = f.cursor ? null : await qb.clone().getCount();
        const cursor = Number(f.cursor);
        if (Number.isInteger(cursor) && cursor > 0)
            qb.andWhere('h.id < :cursor', { cursor });
        const rows = await qb
            .orderBy('h.id', 'DESC')
            .take(limit + 1)
            .getMany();
        const items = rows.slice(0, limit);
        return {
            items,
            nextCursor: rows.length > limit ? items[items.length - 1].id : null,
            total,
        };
    }
    async categories(orgId, username) {
        const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
        const rows = await qb
            .select('h.category', 'category')
            .addSelect('COUNT(*)', 'n')
            .groupBy('h.category')
            .getRawMany();
        const byId = new Map();
        let total = 0;
        for (const r of rows) {
            const n = Number(r.n) || 0;
            total += n;
            const id = (0, category_1.normalizeCategory)(r.category);
            const cur = byId.get(id);
            if (cur)
                cur.count += n;
            else
                byId.set(id, {
                    id,
                    name: (r.category ?? '').trim() || 'Uncategorized',
                    count: n,
                });
        }
        return {
            total,
            categories: [...byId.values()].sort((a, b) => b.count - a.count),
        };
    }
    async lookup(orgId, username, f) {
        const pid = Number(f.profileItemId);
        if (Number.isInteger(pid) && pid > 0) {
            const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
            const hit = await qb
                .andWhere('h.profileFeedItemId = :pid', { pid })
                .getOne();
            if (hit)
                return { id: hit.id, layerId: hit.layer?.id ?? null };
        }
        if (f.title != null && f.author) {
            const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
            qb.andWhere('h.title IS NOT DISTINCT FROM :title', { title: f.title })
                .andWhere('h.username = :author', { author: f.author })
                .andWhere('h.description IS NOT DISTINCT FROM :description', {
                description: f.description ?? null,
            });
            const hit = await qb.orderBy('h.id', 'DESC').getOne();
            if (hit)
                return { id: hit.id, layerId: hit.layer?.id ?? null };
        }
        throw new common_1.NotFoundException('Card not found or not accessible');
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(homefeed_entity_1.Homefeed)),
    __metadata("design:paramtypes", [homefeed_service_1.HomefeedService,
        typeorm_2.Repository])
], FeedService);
//# sourceMappingURL=feed.service.js.map