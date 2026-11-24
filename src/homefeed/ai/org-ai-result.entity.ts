// src/homefeed/ai/org-ai-result.entity.ts
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
import { Organization } from 'src/organization/organization.entity';

export type OrgAiStatus = 'pending' | 'done' | 'error';

/**
 * An org-wide AI generation (e.g. new-space ideas for a category): the
 * job's progress and, once done, its result.
 *
 * `scope` narrows the feature (the category id). `signature` hashes the
 * exact cards the requester could see, so a result is only served to
 * someone whose visible cards are identical.
 */
@Entity()
@Unique(['organization', 'kind', 'scope', 'signature'])
@Index(['organization', 'kind', 'scope'])
export class OrgAiResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: false })
  organization: Organization;

  @Column({ length: 32 })
  kind: string;

  @Column({ length: 128 })
  scope: string;

  @Column({ length: 64 })
  signature: string;

  @Column({ length: 16 })
  status: OrgAiStatus;

  @Column({ length: 80, nullable: true })
  model?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  result?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
