// src/homefeed/ai/space-ideas.service.ts
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgAiResult } from './org-ai-result.entity';
import { LayerSummary } from '../layer-summary.entity';
import { HomefeedService } from '../homefeed.service';
import { AiError, geminiConfig } from './gemini';
import {
  IdeasInputError,
  IdeasTarget,
  PreparedIdeas,
  SPACE_IDEAS_KIND,
  SpaceTopic,
  normalizeCategory,
  prepareIdeas,
  runIdeas,
} from './space-ideas';
import { clip } from './ai-prompts';
import type { AiJobView } from './ai.service';

// Visible cards read per request (newest first, member spaces first).
const MAX_FEED = 500;
const STALE_MS = 3 * 60 * 1000;
const KEEP_PER_SCOPE = 5;
const SIGNATURE_RE = /^[a-f0-9]{64}$/;

export type IdeasBody = {
  category?: unknown;
  categoryName?: unknown;
  categoryDescription?: unknown;
  force?: boolean;
};

/**
 * New-space ideas for an Explore category, built from every space the
 * user can see. Runs as a background job like the per-space AI features.
 */
@Injectable()
export class SpaceIdeasService {
  private readonly running = new Set<string>();

  constructor(
    @InjectRepository(OrgAiResult)
    private readonly rows: Repository<OrgAiResult>,
    @InjectRepository(LayerSummary)
    private readonly summaries: Repository<LayerSummary>,
    private readonly homefeed: HomefeedService,
  ) {}

  private scopeOf(raw: unknown): string {
    const id = typeof raw === 'string' ? normalizeCategory(raw) : '';
    if (!id || id === 'all' || id.length > 120)
      throw new BadRequestException('Pick a category first.');
    return id;
  }

  private find(orgId: number, scope: string, signature: string) {
    return this.rows.findOne({
      where: {
        organization: { id: orgId },
        kind: SPACE_IDEAS_KIND,
        scope,
        signature,
      },
    });
  }

  private isLive(row: OrgAiResult | null, key: string) {
    if (!row || row.status !== 'pending') return false;
    return (
      this.running.has(key) ||
      Date.now() - new Date(row.updatedAt).getTime() < STALE_MS
    );
  }

  /** Latest saved topic/tagline per space, as top-down context. */
  private async topics(layerIds: number[]) {
    const map = new Map<number, SpaceTopic>();
    if (!layerIds.length) return map;
    const { tableName } = this.summaries.metadata;
    const rows: { layerId: number; topic: string; tagline: string }[] =
      await this.summaries.query(
        `SELECT DISTINCT ON ("layerId") "layerId", summary->>'topic' AS topic, summary->>'tagline' AS tagline
           FROM "${tableName}"
          WHERE "layerId" = ANY($1) AND summary ? 'topic'
          ORDER BY "layerId", "updatedAt" DESC`,
        [layerIds],
      );
    rows.forEach((r) =>
      map.set(Number(r.layerId), { topic: r.topic, tagline: r.tagline }),
    );
    return map;
  }

  /** POST: return saved ideas for what the user can see, or start a run. */
  async start(
    orgId: number,
    username: string,
    body: IdeasBody,
  ): Promise<AiJobView> {
    const scope = this.scopeOf(body?.category);
    const target: IdeasTarget = {
      id: scope,
      name: clip(body?.categoryName, 80) || scope,
      description: clip(body?.categoryDescription, 200) || undefined,
    };

    const { apiKey, model } = geminiConfig();
    if (!apiKey) throw new ServiceUnavailableException('AI is not configured.');

    // Visibility-safe: the same query as the user's own feed.
    const cards = await this.homefeed.getHomeFeed(orgId, username, MAX_FEED, {
      onlyLayered: true,
    });
    const layerIds = [
      ...new Set(cards.map((c) => c.layer?.id).filter(Boolean)),
    ] as number[];

    let prepared: PreparedIdeas;
    try {
      prepared = prepareIdeas(
        model,
        target,
        cards,
        await this.topics(layerIds),
      );
    } catch (e) {
      if (e instanceof IdeasInputError)
        throw new BadRequestException(e.message);
      throw e;
    }
    const { signature } = prepared;
    const key = `${orgId}:${scope}:${signature}`;

    const row = await this.find(orgId, scope, signature);
    if (!body?.force && row?.status === 'done' && row.result)
      return { status: 'done', signature, result: row.result };
    if (this.isLive(row, key)) return { status: 'pending', signature };

    await this.rows.upsert(
      {
        organization: { id: orgId },
        kind: SPACE_IDEAS_KIND,
        scope,
        signature,
        status: 'pending',
        error: null,
        // keep a previous result readable until the new one lands
        ...(row?.result ? {} : { result: null }),
        model,
      },
      { conflictPaths: ['organization', 'kind', 'scope', 'signature'] },
    );
    await this.rows.update(
      { organization: { id: orgId }, kind: SPACE_IDEAS_KIND, scope, signature },
      { updatedAt: new Date() },
    );

    this.running.add(key);
    void this.run(orgId, scope, prepared, apiKey, model).finally(() =>
      this.running.delete(key),
    );
    return { status: 'pending', signature };
  }

  /** GET: where a run stands. */
  async status(
    orgId: number,
    username: string,
    category: unknown,
    signature: unknown,
  ): Promise<AiJobView> {
    const scope = this.scopeOf(category);
    if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature))
      throw new BadRequestException('Invalid signature');
    await this.homefeed.assertMember(orgId, username);

    const row = await this.find(orgId, scope, signature);
    const key = `${orgId}:${scope}:${signature}`;
    if (this.isLive(row, key)) return { status: 'pending', signature };
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

  private async run(
    orgId: number,
    scope: string,
    p: PreparedIdeas,
    apiKey: string,
    model: string,
  ) {
    const where = {
      organization: { id: orgId },
      kind: SPACE_IDEAS_KIND,
      scope,
      signature: p.signature,
    };
    const started = Date.now();
    try {
      const result = await runIdeas(p, apiKey, model);
      if (result.ideas.length) {
        await this.rows.update(where, { status: 'done', error: null, result });
        await this.prune(orgId, scope);
      } else {
        await this.rows.update(where, {
          status: 'error',
          error: 'No space ideas came back. Try again.',
        });
      }
      console.log(
        `[ai] ${SPACE_IDEAS_KIND} org=${orgId} scope=${scope} spaces=${p.spaces.length} cards=${p.cardCount} ${Date.now() - started}ms`,
      );
    } catch (e) {
      console.error(`[ai] ${SPACE_IDEAS_KIND} org=${orgId} failed`, e);
      const message =
        e instanceof AiError ? e.message : 'Generation failed. Try again.';
      await this.rows
        .update(where, { status: 'error', error: message })
        .catch((err) => console.error('[ai] could not record failure', err));
    }
  }

  /** Keep only the latest few results per org and category. */
  private async prune(orgId: number, scope: string) {
    const { tableName } = this.rows.metadata;
    await this.rows
      .query(
        `DELETE FROM "${tableName}"
          WHERE "organizationId" = $1 AND kind = $2 AND scope = $3 AND status <> 'pending'
            AND id NOT IN (
              SELECT id FROM "${tableName}"
               WHERE "organizationId" = $1 AND kind = $2 AND scope = $3 AND status <> 'pending'
               ORDER BY "updatedAt" DESC LIMIT $4)`,
        [orgId, SPACE_IDEAS_KIND, scope, KEEP_PER_SCOPE],
      )
      .catch((e) => console.error('[ai] prune failed', e));
  }
}
