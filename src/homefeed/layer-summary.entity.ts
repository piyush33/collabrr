// src/homefeed/layer-summary.entity.ts
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
import { LinkedCardLayer } from './linked-card-layer.entity';

/**
 * Saved AI summary of a connected-collection layer.
 *
 * `signature` is a hash of the exact cards (and model/prompt inputs) the
 * summary was generated from. Viewers who can see different cards produce
 * different signatures, so a summary is only ever served to someone who
 * sent the same card set it was built from.
 */
@Entity()
@Unique(['layer', 'signature'])
export class LayerSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { onDelete: 'CASCADE', nullable: false })
  layer: LinkedCardLayer;

  @Column({ length: 64 })
  signature: string;

  @Column({ length: 80, nullable: true })
  model?: string;

  @Column({ type: 'jsonb' })
  summary: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
