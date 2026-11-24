// src/homefeed/ai/ai.service.ts
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiJob } from './ai-job.entity';
import { LayerSummary } from '../layer-summary.entity';
import { LayerSummaryService } from '../layer-summary.service';
import { HomefeedService } from '../homefeed.service';
import {
  AI_KINDS,
  AiKind,
  InputError,
  Prepared,
  SpaceBody,
  generate,
  prepare,
} from './ai-prompts';
import { AiError, geminiConfig } from './gemini';

// A pending job older than this is treated as lost (e.g. the server
// restarted mid-run) and may be started again.
const STALE_MS = 2 * 60 * 1000;
const SIGNATURE_RE = /^[a-f0-9]{64}$/;

export type AiJobView =
  | { status: 'done'; signature: string; result: Record<string, unknown> }
  | { status: 'pending'; signature: string }
  | { status: 'error'; signature: string; error: string }
  | { status: 'missing'; signature: string };

/**
 * Runs AI generations in the background so no request has to stay open
 * for the length of a model call (the frontend host cuts requests off at
 * 28s). The browser starts a job, then polls its status.
 */
@Injectable()
export class AiService {
  /** Jobs running in this process, keyed by layer:kind:signature. */
  private readonly running = new Set<string>();

  constructor(
    @InjectRepository(AiJob) private readonly jobs: Repository<AiJob>,
    @InjectRepository(LayerSummary)
    private readonly results: Repository<LayerSummary>,
    private readonly summaries: LayerSummaryService,
    private readonly homefeed: HomefeedService,
  ) {}

  private kindOf(kind: string): AiKind {
    if (!AI_KINDS.includes(kind as AiKind))
      throw new BadRequestException('Unknown AI feature');
    return kind as AiKind;
  }

  private savedResult(layerId: number, signature: string) {
    return this.results.findOne({
      where: { layer: { id: layerId }, signature },
    });
  }

  private findJob(layerId: number, kind: AiKind, signature: string) {
    return this.jobs.findOne({
      where: { layer: { id: layerId }, kind, signature },
    });
  }

  private isLive(job: AiJob | null, key: string) {
    if (!job || job.status !== 'pending') return false;
    return (
      this.running.has(key) ||
      Date.now() - new Date(job.updatedAt).getTime() < STALE_MS
    );
  }

  /** POST: return the saved result, or start (or join) a generation. */
  async start(
    orgId: number,
    layerId: number,
    username: string,
    kindParam: string,
    body: SpaceBody,
  ): Promise<AiJobView> {
    const kind = this.kindOf(kindParam);
    await this.homefeed.assertLayerAccess(orgId, username, layerId);

    const { apiKey, model } = geminiConfig();
    if (!apiKey) throw new ServiceUnavailableException('AI is not configured.');

    let prepared: Prepared;
    try {
      prepared = prepare(kind, model, body ?? {});
    } catch (e) {
      if (e instanceof InputError) throw new BadRequestException(e.message);
      throw e;
    }
    const { signature } = prepared;
    const key = `${layerId}:${kind}:${signature}`;

    if (!body?.force) {
      const saved = await this.savedResult(layerId, signature);
      if (saved) return { status: 'done', signature, result: saved.summary };
    }

    const job = await this.findJob(layerId, kind, signature);
    if (this.isLive(job, key)) return { status: 'pending', signature };

    await this.jobs.upsert(
      {
        layer: { id: layerId },
        kind,
        signature,
        status: 'pending',
        error: null,
      },
      { conflictPaths: ['layer', 'kind', 'signature'] },
    );
    // upsert doesn't bump updatedAt on conflict in every driver; be explicit
    await this.jobs.update(
      { layer: { id: layerId }, kind, signature },
      { updatedAt: new Date() },
    );

    this.running.add(key);
    void this.run(orgId, layerId, username, prepared, apiKey, model).finally(
      () => this.running.delete(key),
    );
    return { status: 'pending', signature };
  }

  /** GET: where a generation stands. */
  async status(
    orgId: number,
    layerId: number,
    username: string,
    kindParam: string,
    signature: unknown,
  ): Promise<AiJobView> {
    const kind = this.kindOf(kindParam);
    if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature))
      throw new BadRequestException('Invalid signature');
    await this.homefeed.assertLayerAccess(orgId, username, layerId);

    const job = await this.findJob(layerId, kind, signature);
    const key = `${layerId}:${kind}:${signature}`;
    if (this.isLive(job, key)) return { status: 'pending', signature };

    const saved = await this.savedResult(layerId, signature);
    if (saved) return { status: 'done', signature, result: saved.summary };

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

  private async run(
    orgId: number,
    layerId: number,
    username: string,
    p: Prepared,
    apiKey: string,
    model: string,
  ) {
    const where = {
      layer: { id: layerId },
      kind: p.kind,
      signature: p.signature,
    };
    const started = Date.now();
    try {
      const result = await generate(p, apiKey, model);
      if (result) {
        await this.summaries.save(orgId, layerId, username, {
          signature: p.signature,
          model,
          summary: result,
        });
        await this.jobs.update(where, { status: 'done', error: null });
      } else {
        await this.jobs.update(where, {
          status: 'error',
          error: 'No suggestions came back. Try again.',
        });
      }
      console.log(
        `[ai] ${p.kind} layer=${layerId} cards=${p.compact.length} ${Date.now() - started}ms`,
      );
    } catch (e) {
      console.error(`[ai] ${p.kind} layer=${layerId} failed`, e);
      const message =
        e instanceof AiError ? e.message : 'Generation failed. Try again.';
      await this.jobs
        .update(where, { status: 'error', error: message })
        .catch((err) => console.error('[ai] could not record failure', err));
    }
  }
}
