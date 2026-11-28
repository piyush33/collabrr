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
exports.ConvergeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const think_entities_1 = require("./think.entities");
const MAX_TIMER_MS = 7 * 24 * 3600 * 1000;
const STOP = new Set('a an the of to for in on and or vs versus should we our is are be how what which do does it this that with as by'.split(' '));
const words = (t) => new Set((t || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w)));
const jaccard = (a, b) => {
    if (!a.size || !b.size)
        return 0;
    let n = 0;
    for (const x of a)
        if (b.has(x))
            n++;
    return n / (a.size + b.size - n);
};
const cardsOf = (p) => new Set((p.positions ?? []).flatMap((x) => x.cardIds ?? []));
function sameTension(a, b) {
    const ca = cardsOf(a);
    const cb = cardsOf(b);
    const shared = [...ca].filter((x) => cb.has(x)).length;
    const small = Math.min(ca.size, cb.size);
    const cardOverlap = small ? shared / small : 0;
    const wordOverlap = jaccard(words(a.question), words(b.question));
    return (cardOverlap >= 0.8 ||
        (cardOverlap >= 0.5 && wordOverlap >= 0.1) ||
        wordOverlap >= 0.5);
}
let ConvergeService = class ConvergeService {
    constructor(readings, votes, timers) {
        this.readings = readings;
        this.votes = votes;
        this.timers = timers;
    }
    async state(layerId) {
        const [reading, votes, timers] = await Promise.all([
            this.readings.findOne({ where: { layer: { id: layerId } } }),
            this.votes.find({ where: { layer: { id: layerId } } }),
            this.timers.find({ where: { layer: { id: layerId } } }),
        ]);
        const v = {};
        for (const row of votes)
            (v[row.pointId] ??= {})[row.username] = row.position;
        const t = {};
        for (const row of timers)
            t[row.pointId] = {
                deadline: row.deadline ? new Date(row.deadline).getTime() : null,
                remaining: row.remainingMs != null ? Number(row.remainingMs) : null,
                running: row.running,
                setBy: row.setBy,
            };
        return {
            analysis: reading
                ? {
                    points: reading.points ?? [],
                    generatedAt: new Date(reading.updatedAt).toISOString(),
                    signature: reading.signature,
                }
                : null,
            votes: v,
            timers: t,
        };
    }
    async previousFor(layerId, mode, convergedIds) {
        const s = await this.state(layerId);
        const isLocked = (id) => Object.keys(s.votes[id] ?? {}).length > 0 || !!s.timers[id];
        const all = s.analysis?.points ?? [];
        return (mode === 'update' ? all : all.filter((p) => isLocked(p.id))).map(({ id, phase, question, positions }) => ({
            id,
            phase,
            question,
            positions,
            locked: isLocked(id),
            converged: convergedIds.includes(id),
        }));
    }
    async applyReading(layerId, mode, aiPoints, signature, convergedIds) {
        const s = await this.state(layerId);
        const isLocked = (id) => Object.keys(s.votes[id] ?? {}).length > 0 || !!s.timers[id];
        const converged = new Set(convergedIds);
        const before = new Map((s.analysis?.points ?? []).map((p) => [p.id, p]));
        const points = [];
        const kept = new Set();
        for (const p of aiPoints) {
            const old = p.previousId ? before.get(p.previousId) : undefined;
            if (old && !kept.has(old.id) && (mode === 'update' || isLocked(old.id))) {
                points.push(isLocked(old.id)
                    ? old
                    : {
                        ...old,
                        status: p.status ?? old.status,
                        missing: p.missing ?? old.missing,
                        leaning: p.leaning ?? old.leaning,
                    });
                kept.add(old.id);
            }
            else if (!old) {
                if ([...before.values()].some((o) => isLocked(o.id) && sameTension(p, o)))
                    continue;
                const { previousId: _drop, ...rest } = p;
                void _drop;
                points.push({ ...rest, id: (0, crypto_1.randomUUID)() });
            }
        }
        for (const old of before.values()) {
            if (!kept.has(old.id) && isLocked(old.id) && !converged.has(old.id)) {
                points.push(old);
                kept.add(old.id);
            }
        }
        const layer = { id: layerId };
        const existing = await this.readings.findOne({
            where: { layer: { id: layerId } },
        });
        await this.readings.save({ ...(existing ?? {}), layer, points, signature });
        const gone = [...before.keys()].filter((id) => !kept.has(id));
        if (gone.length) {
            await this.votes
                .createQueryBuilder()
                .delete()
                .where('"layerId" = :layerId AND "pointId" IN (:...gone)', {
                layerId,
                gone,
            })
                .execute();
            await this.timers
                .createQueryBuilder()
                .delete()
                .where('"layerId" = :layerId AND "pointId" IN (:...gone)', {
                layerId,
                gone,
            })
                .execute();
        }
        return this.state(layerId);
    }
    async pointExists(layerId, pointId) {
        const reading = await this.readings.findOne({
            where: { layer: { id: layerId } },
        });
        if (!reading?.points?.some((p) => p.id === pointId))
            throw new common_1.BadRequestException('Unknown point');
        return reading.points.find((p) => p.id === pointId);
    }
    async vote(layerId, username, pointId, position) {
        const point = await this.pointExists(layerId, pointId);
        const where = { layer: { id: layerId }, pointId, username };
        if (position === null || position === undefined) {
            await this.votes.delete(where);
        }
        else {
            const idx = Number(position);
            if (!Number.isInteger(idx) || idx < 0 || idx >= point.positions.length)
                throw new common_1.BadRequestException('Unknown position');
            const existing = await this.votes.findOne({ where });
            await this.votes.save({
                ...(existing ?? {}),
                layer: { id: layerId },
                pointId,
                username,
                position: idx,
            });
        }
        return this.state(layerId);
    }
    async timer(layerId, username, pointId, op, durationMs) {
        await this.pointExists(layerId, pointId);
        const where = { layer: { id: layerId }, pointId };
        const t = await this.timers.findOne({ where });
        const now = Date.now();
        if (op === 'set') {
            const ms = Number(durationMs);
            if (!Number.isFinite(ms) || ms < 60_000 || ms > MAX_TIMER_MS)
                throw new common_1.BadRequestException('Timer must be between 1 minute and 7 days');
            await this.timers.save({
                ...(t ?? {}),
                layer: { id: layerId },
                pointId,
                deadline: new Date(now + ms),
                remainingMs: null,
                running: true,
                setBy: username,
            });
        }
        else if (op === 'pause' && t?.running && t.deadline) {
            await this.timers.save({
                ...t,
                running: false,
                remainingMs: String(Math.max(0, new Date(t.deadline).getTime() - now)),
                deadline: null,
            });
        }
        else if (op === 'resume' && t && !t.running && t.remainingMs != null) {
            await this.timers.save({
                ...t,
                running: true,
                deadline: new Date(now + Number(t.remainingMs)),
                remainingMs: null,
            });
        }
        else if (op === 'clear') {
            if (t)
                await this.timers.remove(t);
        }
        else if (!['pause', 'resume'].includes(op)) {
            throw new common_1.BadRequestException('Unknown timer action');
        }
        return this.state(layerId);
    }
};
exports.ConvergeService = ConvergeService;
exports.ConvergeService = ConvergeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(think_entities_1.ConvergeReading)),
    __param(1, (0, typeorm_1.InjectRepository)(think_entities_1.ConvergeVote)),
    __param(2, (0, typeorm_1.InjectRepository)(think_entities_1.ConvergeTimer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConvergeService);
//# sourceMappingURL=converge.service.js.map