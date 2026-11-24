// src/homefeed/feed.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homefeed } from './homefeed.entity';
import { HomefeedService } from './homefeed.service';
import { normalizeCategory } from './category';
import { Phase, RoleType } from 'src/common/enums/content-metadata.enum';

const DEFAULT_PAGE = 30;
const MAX_PAGE = 100;
const PHASES = new Set<string>(Object.values(Phase));
const ROLES = new Set<string>(Object.values(RoleType));

/** Query string of GET /homefeed/feed (all optional). */
export type FeedQuery = {
  cursor?: string; // id of the last card already shown
  limit?: string;
  category?: string; // normalised category id; "all" = no filter
  phases?: string; // comma-separated phase ids (any of)
  roles?: string; // comma-separated role ids (any of)
  q?: string; // text search in title / description / text / author
  from?: string; // ISO date-time, inclusive
  to?: string; // ISO date-time, inclusive
  content?: string; // images | text | links
  author?: string; // username
};

export type FeedPage = {
  items: Homefeed[];
  /** Pass back as `cursor` for the next page; null when there is no more. */
  nextCursor: number | null;
  /** Cards matching the filters (first page only, else null). */
  total: number | null;
};

const list = (s?: string) =>
  (s ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const date = (s?: string) => {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

/**
 * Paged, filtered card feed for Explore and Home. Filtering happens in the
 * database so every card is reachable, however large the org gets; pages
 * are keyed by card id (newest first), so new cards never shift a page.
 */
@Injectable()
export class FeedService {
  constructor(
    private readonly homefeed: HomefeedService,
    @InjectRepository(Homefeed)
    private readonly cards: Repository<Homefeed>,
  ) {}

  /** Raw category values in the org that normalise to `id`. */
  private async rawCategories(orgId: number, id: string) {
    const rows: { category: string | null }[] = await this.cards
      .createQueryBuilder('h')
      .select('DISTINCT h.category', 'category')
      .where('h.organizationId = :orgId', { orgId })
      .getRawMany();
    return rows
      .map((r) => r.category)
      .filter((c) => normalizeCategory(c) === id);
  }

  async page(orgId: number, username: string, f: FeedQuery): Promise<FeedPage> {
    const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
    const limit = Math.min(
      Math.max(Number(f.limit) || DEFAULT_PAGE, 1),
      MAX_PAGE,
    );

    const category = (f.category ?? '').trim();
    if (category && category !== 'all') {
      const raws = await this.rawCategories(orgId, normalizeCategory(category));
      const named = raws.filter((r): r is string => r != null);
      const withNull = raws.some((r) => r == null);
      if (!named.length && !withNull)
        return { items: [], nextCursor: null, total: f.cursor ? null : 0 };
      qb.andWhere(
        named.length && withNull
          ? '(h.category IN (:...cats) OR h.category IS NULL)'
          : named.length
            ? 'h.category IN (:...cats)'
            : 'h.category IS NULL',
        { cats: named },
      );
    }

    const phases = list(f.phases).filter((p) => PHASES.has(p));
    if (phases.length) qb.andWhere('h.phase IN (:...phases)', { phases });

    const roles = list(f.roles).filter((r) => ROLES.has(r));
    if (roles.length)
      qb.andWhere('h."roleTypes" && ARRAY[:...roles]::role_type_enum[]', {
        roles,
      });

    const q = (f.q ?? '').trim().slice(0, 200);
    if (q) {
      const like = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
      qb.andWhere(
        '(h.title ILIKE :like OR h.description ILIKE :like OR h.text ILIKE :like OR h.username ILIKE :like)',
        { like },
      );
    }

    const from = date(f.from);
    if (from) qb.andWhere('h.createdAt >= :from', { from });
    const to = date(f.to);
    if (to) qb.andWhere('h.createdAt <= :to', { to });

    if (f.content === 'images') qb.andWhere("COALESCE(h.image, '') <> ''");
    else if (f.content === 'text')
      qb.andWhere("COALESCE(h.text, '') <> '' AND COALESCE(h.image, '') = ''");
    else if (f.content === 'links')
      qb.andWhere("COALESCE(h.weblink, '') <> ''");

    if (f.author) qb.andWhere('h.username = :author', { author: f.author });

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

  /** Card counts per normalised category, over what the user can see. */
  async categories(orgId: number, username: string) {
    const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
    const rows: { category: string | null; n: string }[] = await qb
      .select('h.category', 'category')
      .addSelect('COUNT(*)', 'n')
      .groupBy('h.category')
      .getRawMany();

    const byId = new Map<string, { id: string; name: string; count: number }>();
    let total = 0;
    for (const r of rows) {
      const n = Number(r.n) || 0;
      total += n;
      const id = normalizeCategory(r.category);
      const cur = byId.get(id);
      if (cur) cur.count += n;
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

  /**
   * Find the feed card behind a profile post: the card created with it,
   * else the newest visible card with the same title, description and
   * author (how reposts are matched).
   */
  async lookup(
    orgId: number,
    username: string,
    f: {
      profileItemId?: string;
      title?: string;
      description?: string;
      author?: string;
    },
  ) {
    const pid = Number(f.profileItemId);
    if (Number.isInteger(pid) && pid > 0) {
      const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
      const hit = await qb
        .andWhere('h.profileFeedItemId = :pid', { pid })
        .getOne();
      if (hit) return { id: hit.id, layerId: hit.layer?.id ?? null };
    }
    if (f.title != null && f.author) {
      const { qb } = await this.homefeed.visibleCardsQuery(orgId, username);
      qb.andWhere('h.title IS NOT DISTINCT FROM :title', { title: f.title })
        .andWhere('h.username = :author', { author: f.author })
        .andWhere('h.description IS NOT DISTINCT FROM :description', {
          description: f.description ?? null,
        });
      const hit = await qb.orderBy('h.id', 'DESC').getOne();
      if (hit) return { id: hit.id, layerId: hit.layer?.id ?? null };
    }
    throw new NotFoundException('Card not found or not accessible');
  }
}
