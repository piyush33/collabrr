// src/homefeed/think/think.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { LessThan, Repository } from 'typeorm';
import { HomefeedService } from '../homefeed.service';
import { AiError } from '../ai/gemini';
import { ThinkTask } from './think.entities';
import { ConvergeService } from './converge.service';
import {
  callOutcome,
  chatCard,
  chatSpace,
  chatWide,
  converge,
  decide,
  toCard,
} from './think-prompts';

// A pending task older than this is treated as lost (e.g. a server restart).
const STALE_MS = 3 * 60 * 1000;
// Finished tasks are kept this long, then cleaned up.
const KEEP_MS = 24 * 3600 * 1000;

const KINDS = [
  'chat-card',
  'chat-space',
  'chat-wide',
  'to-card',
  'decide',
  'call-outcome',
  'converge-read',
] as const;
type Kind = (typeof KINDS)[number];
// Kinds that work on one space (and so need access to it).
const LAYER_KINDS: Kind[] = [
  'chat-card',
  'chat-space',
  'decide',
  'call-outcome',
  'converge-read',
];

/**
 * Ask AI and Converge model calls, run in the background: the browser
 * starts a task and polls it, so no request outlives the frontend host's
 * 28s limit. Identity comes from the JWT; space work needs access to the
 * space, everything else membership of the workspace.
 */
@Injectable()
export class ThinkService {
  constructor(
    @InjectRepository(ThinkTask) private readonly tasks: Repository<ThinkTask>,
    private readonly homefeed: HomefeedService,
    private readonly convergeState: ConvergeService,
  ) {}

  async start(orgId: number, username: string, kindIn: string, body: any) {
    if (!KINDS.includes(kindIn as Kind))
      throw new BadRequestException('Unknown AI feature');
    const kind = kindIn as Kind;
    if (!body || typeof body !== 'object')
      throw new BadRequestException('Missing body');
    if (!Array.isArray(body.cards)) body.cards = [];

    const layerId = body.layerId != null ? Number(body.layerId) : null;
    if (LAYER_KINDS.includes(kind) && !Number.isInteger(layerId))
      throw new BadRequestException('layerId is required');
    if (layerId != null && Number.isInteger(layerId))
      await this.homefeed.assertLayerAccess(orgId, username, layerId);
    else await this.homefeed.assertMember(orgId, username);

    const task = await this.tasks.save({
      id: randomUUID(),
      orgId,
      layerId,
      username,
      kind,
      status: 'pending',
      result: null,
      error: null,
    });
    void this.run(task.id, kind, layerId, body);
    // Opportunistic cleanup of old finished tasks.
    void this.tasks
      .delete({ updatedAt: LessThan(new Date(Date.now() - KEEP_MS)) })
      .catch(() => undefined);
    return { id: task.id, status: 'pending' as const };
  }

  private async run(id: string, kind: Kind, layerId: number | null, body: any) {
    try {
      let result: unknown;
      switch (kind) {
        case 'chat-card':
          result = await chatCard(body);
          break;
        case 'chat-space':
          result = await chatSpace(body);
          break;
        case 'chat-wide':
          result = await chatWide(body);
          break;
        case 'to-card':
          result = await toCard(body);
          break;
        case 'decide':
          result = await decide(body);
          break;
        case 'call-outcome':
          if (!String(body.notes ?? '').trim())
            throw new AiError('Add some notes from the call first.');
          result = await callOutcome(body);
          break;
        case 'converge-read': {
          // The server decides which points are locked (votes or a timer).
          const mode = body.mode === 'fresh' ? 'fresh' : 'update';
          const convergedIds: string[] = Array.isArray(body.convergedIds)
            ? body.convergedIds.map(String)
            : [];
          const previous = await this.convergeState.previousFor(
            layerId!,
            mode,
            convergedIds,
          );
          const { points } = (await converge({ ...body, previous })) as {
            points?: any[];
          };
          result = await this.convergeState.applyReading(
            layerId!,
            mode,
            points ?? [],
            String(body.signature ?? ''),
            convergedIds,
          );
          break;
        }
      }
      await this.tasks.update(id, {
        status: 'done',
        result: result as Record<string, unknown>,
      });
    } catch (e) {
      console.error(`[think:${kind}]`, e);
      await this.tasks.update(id, {
        status: 'error',
        error: e instanceof AiError ? e.message : 'The AI request failed.',
      });
    }
  }

  async get(orgId: number, username: string, id: string) {
    const task = await this.tasks.findOne({ where: { id, orgId, username } });
    if (!task) throw new NotFoundException('Task not found');
    if (
      task.status === 'pending' &&
      Date.now() - new Date(task.updatedAt).getTime() > STALE_MS
    )
      return {
        id,
        status: 'error',
        error: 'The AI request timed out. Try again.',
      };
    return { id, status: task.status, result: task.result, error: task.error };
  }
}
