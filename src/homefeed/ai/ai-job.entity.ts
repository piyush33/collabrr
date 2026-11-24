// src/homefeed/ai/ai-job.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LinkedCardLayer } from '../linked-card-layer.entity';

export type AiJobStatus = 'pending' | 'done' | 'error';

/**
 * One AI generation run (space summary or card suggestions) for a layer
 * and an exact card set (`signature`). The result itself is stored in
 * LayerSummary under the same signature; this row only tracks progress so
 * the browser can poll instead of holding a long request open.
 */
@Entity()
@Unique(['layer', 'kind', 'signature'])
export class AiJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { onDelete: 'CASCADE', nullable: false })
  layer: LinkedCardLayer;

  @Column({ length: 32 })
  kind: string;

  @Column({ length: 64 })
  signature: string;

  @Column({ length: 16 })
  status: AiJobStatus;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
