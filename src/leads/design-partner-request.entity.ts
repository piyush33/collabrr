// src/leads/design-partner-request.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** A "Become a design partner" request from the marketing site. */
@Entity()
export class DesignPartnerRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Index()
  @Column({ length: 200 })
  email: string;

  @Column({ length: 160 })
  company: string;

  @Column({ length: 80, nullable: true })
  role?: string | null;

  /** e.g. "20-50" */
  @Column({ length: 20 })
  teamSize: string;

  /** e.g. "3+" */
  @Column({ length: 20 })
  timeZones: string;

  /** The live decision they'd bring. */
  @Column({ type: 'text', nullable: true })
  decision?: string | null;

  @Column({ length: 80, nullable: true })
  source?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
