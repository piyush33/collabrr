// src/homefeed/think/think.entities.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LinkedCardLayer } from '../linked-card-layer.entity';

export type ThinkTaskStatus = 'pending' | 'done' | 'error';

/**
 * One Ask AI / Converge model call, run in the background so no request
 * stays open past the frontend host's 28s limit. Only its owner can read it.
 */
@Entity()
export class ThinkTask {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column()
  orgId: number;

  @Column({ type: 'int', nullable: true })
  layerId: number | null;

  @Column({ length: 64 })
  username: string;

  @Column({ length: 32 })
  kind: string;

  @Column({ length: 16 })
  status: ThinkTaskStatus;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type ConvergePosition = {
  stance: string;
  summary: string;
  cardIds: number[];
};
export type ConvergePoint = {
  id: string;
  phase: string;
  question: string;
  status: string;
  positions: ConvergePosition[];
  missing: string;
  leaning: string;
};

/** The latest Converge reading of a space: its open points. */
@Entity()
export class ConvergeReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @ManyToOne(() => LinkedCardLayer, { onDelete: 'CASCADE', nullable: false })
  layer: LinkedCardLayer;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  points: ConvergePoint[];

  /** The space's card ids when read, to tell when cards have changed. */
  @Column({ type: 'text', default: '' })
  signature: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

/** One person backing one position on a point. */
@Entity()
@Unique(['layer', 'pointId', 'username'])
export class ConvergeVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { onDelete: 'CASCADE', nullable: false })
  layer: LinkedCardLayer;

  @Column({ length: 64 })
  pointId: string;

  @Column({ length: 64 })
  username: string;

  @Column()
  position: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

/** A deadline to converge on a point: running to `deadline`, or paused with `remainingMs` left. */
@Entity()
@Unique(['layer', 'pointId'])
export class ConvergeTimer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => LinkedCardLayer, { onDelete: 'CASCADE', nullable: false })
  layer: LinkedCardLayer;

  @Column({ length: 64 })
  pointId: string;

  @Column({ type: 'timestamptz', nullable: true })
  deadline: Date | null;

  @Column({ type: 'bigint', nullable: true })
  remainingMs: string | null;

  @Column()
  running: boolean;

  @Column({ length: 64 })
  setBy: string;
}
