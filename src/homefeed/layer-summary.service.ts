// src/homefeed/layer-summary.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LayerSummary } from './layer-summary.entity';
import { HomefeedService } from './homefeed.service';

const SIGNATURE_RE = /^[a-f0-9]{64}$/;
const MAX_SUMMARY_BYTES = 64 * 1024;
// Older card sets for the same layer are pruned beyond this many rows.
const KEEP_PER_LAYER = 10;

@Injectable()
export class LayerSummaryService {
  constructor(
    @InjectRepository(LayerSummary)
    private readonly repo: Repository<LayerSummary>,
    private readonly homefeedService: HomefeedService,
  ) {}

  private assertSignature(signature: unknown): string {
    if (typeof signature !== 'string' || !SIGNATURE_RE.test(signature)) {
      throw new BadRequestException('Invalid signature');
    }
    return signature;
  }

  async get(
    orgId: number,
    layerId: number,
    username: string,
    signature: unknown,
  ) {
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

  async save(
    orgId: number,
    layerId: number,
    username: string,
    body: { signature?: unknown; model?: unknown; summary?: unknown },
  ) {
    const sig = this.assertSignature(body?.signature);
    const summary = body?.summary;
    if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
      throw new BadRequestException('Invalid summary');
    }
    if (Buffer.byteLength(JSON.stringify(summary)) > MAX_SUMMARY_BYTES) {
      throw new BadRequestException('Summary too large');
    }
    const model =
      typeof body.model === 'string' ? body.model.slice(0, 80) : null;

    await this.homefeedService.assertLayerAccess(orgId, username, layerId);

    await this.repo.upsert(
      {
        layer: { id: layerId },
        signature: sig,
        model,
        summary: summary as Record<string, unknown>,
      },
      { conflictPaths: ['layer', 'signature'] },
    );

    // keep only the most recent summaries for this layer
    const stale = await this.repo.find({
      where: { layer: { id: layerId } },
      order: { updatedAt: 'DESC' },
      skip: KEEP_PER_LAYER,
      select: { id: true },
    });
    if (stale.length) await this.repo.delete(stale.map((s) => s.id));

    return { ok: true };
  }
}
