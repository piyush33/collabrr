// src/homefeed/think/converge.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  ConvergePoint,
  ConvergeReading,
  ConvergeTimer,
  ConvergeVote,
} from './think.entities';

const MAX_TIMER_MS = 7 * 24 * 3600 * 1000;

// Is a "new" point really a reworded copy of an existing one? (Same cited
// cards, or the same question in other words.)
const STOP = new Set(
  'a an the of to for in on and or vs versus should we our is are be how what which do does it this that with as by'.split(
    ' ',
  ),
);
const words = (t: string) =>
  new Set(
    (t || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
const jaccard = <T>(a: Set<T>, b: Set<T>) => {
  if (!a.size || !b.size) return 0;
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n / (a.size + b.size - n);
};
const cardsOf = (p: Pick<ConvergePoint, 'positions'>) =>
  new Set((p.positions ?? []).flatMap((x) => x.cardIds ?? []));
function sameTension(
  a: Pick<ConvergePoint, 'question' | 'positions'>,
  b: Pick<ConvergePoint, 'question' | 'positions'>,
) {
  const ca = cardsOf(a);
  const cb = cardsOf(b);
  const shared = [...ca].filter((x) => cb.has(x)).length;
  const small = Math.min(ca.size, cb.size);
  const cardOverlap = small ? shared / small : 0;
  const wordOverlap = jaccard(words(a.question), words(b.question));
  // Nearly the same cards, or half the same cards with a related question,
  // or clearly the same question.
  return (
    cardOverlap >= 0.8 ||
    (cardOverlap >= 0.5 && wordOverlap >= 0.1) ||
    wordOverlap >= 0.5
  );
}

export type ConvergeState = {
  analysis: {
    points: ConvergePoint[];
    generatedAt: string;
    signature: string;
  } | null;
  votes: Record<string, Record<string, number>>;
  timers: Record<
    string,
    {
      deadline: number | null;
      remaining: number | null;
      running: boolean;
      setBy: string;
    }
  >;
};

type AiPoint = Omit<ConvergePoint, 'id'> & { previousId?: string };

/**
 * Converge state for a space: the open points from the latest reading, the
 * votes on their positions and their timers. A point is locked once anyone
 * has voted on it or set a timer: later readings can't drop, merge or
 * reword it, and it only leaves by converging (then being found settled).
 */
@Injectable()
export class ConvergeService {
  constructor(
    @InjectRepository(ConvergeReading)
    private readonly readings: Repository<ConvergeReading>,
    @InjectRepository(ConvergeVote)
    private readonly votes: Repository<ConvergeVote>,
    @InjectRepository(ConvergeTimer)
    private readonly timers: Repository<ConvergeTimer>,
  ) {}

  async state(layerId: number): Promise<ConvergeState> {
    const [reading, votes, timers] = await Promise.all([
      this.readings.findOne({ where: { layer: { id: layerId } } }),
      this.votes.find({ where: { layer: { id: layerId } } }),
      this.timers.find({ where: { layer: { id: layerId } } }),
    ]);
    const v: ConvergeState['votes'] = {};
    for (const row of votes)
      (v[row.pointId] ??= {})[row.username] = row.position;
    const t: ConvergeState['timers'] = {};
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

  /** Points the next reading must treat as locked or converged. */
  async previousFor(
    layerId: number,
    mode: 'fresh' | 'update',
    convergedIds: string[],
  ) {
    const s = await this.state(layerId);
    const isLocked = (id: string) =>
      Object.keys(s.votes[id] ?? {}).length > 0 || !!s.timers[id];
    const all = s.analysis?.points ?? [];
    return (mode === 'update' ? all : all.filter((p) => isLocked(p.id))).map(
      ({ id, phase, question, positions }) => ({
        id,
        phase,
        question,
        positions,
        locked: isLocked(id),
        converged: convergedIds.includes(id),
      }),
    );
  }

  /** Apply a new reading ("fresh" = Read again, "update" = after cards changed). */
  async applyReading(
    layerId: number,
    mode: 'fresh' | 'update',
    aiPoints: AiPoint[],
    signature: string,
    convergedIds: string[],
  ) {
    const s = await this.state(layerId);
    const isLocked = (id: string) =>
      Object.keys(s.votes[id] ?? {}).length > 0 || !!s.timers[id];
    const converged = new Set(convergedIds);
    const before = new Map((s.analysis?.points ?? []).map((p) => [p.id, p]));
    const points: ConvergePoint[] = [];
    const kept = new Set<string>();

    for (const p of aiPoints) {
      const old = p.previousId ? before.get(p.previousId) : undefined;
      if (old && !kept.has(old.id) && (mode === 'update' || isLocked(old.id))) {
        // Same point: locked ones stay exactly as they were; others take the new status.
        points.push(
          isLocked(old.id)
            ? old
            : {
                ...old,
                status: p.status ?? old.status,
                missing: p.missing ?? old.missing,
                leaning: p.leaning ?? old.leaning,
              },
        );
        kept.add(old.id);
      } else if (!old) {
        // A reworded copy of a locked point is the same tension: keep the original.
        if (
          [...before.values()].some((o) => isLocked(o.id) && sameTension(p, o))
        )
          continue;
        const { previousId: _drop, ...rest } = p;
        void _drop;
        points.push({ ...rest, id: randomUUID() });
      }
    }
    // Locked points the reading left out stay, unless they have converged.
    for (const old of before.values()) {
      if (!kept.has(old.id) && isLocked(old.id) && !converged.has(old.id)) {
        points.push(old);
        kept.add(old.id);
      }
    }

    const layer = { id: layerId } as ConvergeReading['layer'];
    const existing = await this.readings.findOne({
      where: { layer: { id: layerId } },
    });
    await this.readings.save({ ...(existing ?? {}), layer, points, signature });

    // Votes and timers follow the points that stayed.
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

  private async pointExists(layerId: number, pointId: string) {
    const reading = await this.readings.findOne({
      where: { layer: { id: layerId } },
    });
    if (!reading?.points?.some((p) => p.id === pointId))
      throw new BadRequestException('Unknown point');
    return reading.points.find((p) => p.id === pointId)!;
  }

  /** Back a position (index), or withdraw (null). One vote per person per point. */
  async vote(
    layerId: number,
    username: string,
    pointId: string,
    position: number | null,
  ) {
    const point = await this.pointExists(layerId, pointId);
    const where = { layer: { id: layerId }, pointId, username };
    if (position === null || position === undefined) {
      await this.votes.delete(where);
    } else {
      const idx = Number(position);
      if (!Number.isInteger(idx) || idx < 0 || idx >= point.positions.length)
        throw new BadRequestException('Unknown position');
      const existing = await this.votes.findOne({ where });
      await this.votes.save({
        ...(existing ?? {}),
        layer: { id: layerId } as ConvergeVote['layer'],
        pointId,
        username,
        position: idx,
      });
    }
    return this.state(layerId);
  }

  /** Set (durationMs), pause, resume or clear a point's timer. Anyone in the space can. */
  async timer(
    layerId: number,
    username: string,
    pointId: string,
    op: string,
    durationMs?: number,
  ) {
    await this.pointExists(layerId, pointId);
    const where = { layer: { id: layerId }, pointId };
    const t = await this.timers.findOne({ where });
    const now = Date.now();
    if (op === 'set') {
      const ms = Number(durationMs);
      if (!Number.isFinite(ms) || ms < 60_000 || ms > MAX_TIMER_MS)
        throw new BadRequestException(
          'Timer must be between 1 minute and 7 days',
        );
      await this.timers.save({
        ...(t ?? {}),
        layer: { id: layerId } as ConvergeTimer['layer'],
        pointId,
        deadline: new Date(now + ms),
        remainingMs: null,
        running: true,
        setBy: username,
      });
    } else if (op === 'pause' && t?.running && t.deadline) {
      await this.timers.save({
        ...t,
        running: false,
        remainingMs: String(Math.max(0, new Date(t.deadline).getTime() - now)),
        deadline: null,
      });
    } else if (op === 'resume' && t && !t.running && t.remainingMs != null) {
      await this.timers.save({
        ...t,
        running: true,
        deadline: new Date(now + Number(t.remainingMs)),
        remainingMs: null,
      });
    } else if (op === 'clear') {
      if (t) await this.timers.remove(t);
    } else if (!['pause', 'resume'].includes(op)) {
      throw new BadRequestException('Unknown timer action');
    }
    return this.state(layerId);
  }
}
