// src/leads/leads.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignPartnerRequest } from './design-partner-request.entity';

const TEAM_SIZES = ['<20', '20-50', '51-200', '200+'];
const TIME_ZONES = ['1', '2', '3+'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const text = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

/**
 * Public, unauthenticated: the marketing site's design-partner form.
 *   POST /public/design-partners
 *   { name, email, company, role?, teamSize, timeZones, decision?, source?, website? }
 * `website` is a hidden honeypot field; real visitors leave it empty.
 */
@Controller('public/design-partners')
export class LeadsController {
  private readonly hits = new Map<string, number[]>();

  constructor(
    @InjectRepository(DesignPartnerRequest)
    private readonly requests: Repository<DesignPartnerRequest>,
  ) {}

  private limited(ip: string) {
    const now = Date.now();
    const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    this.hits.set(ip, recent);
    if (this.hits.size > 5000) this.hits.clear();
    return recent.length > MAX_PER_WINDOW;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: Record<string, unknown>, @Req() req: any) {
    const ip =
      String(req?.headers?.['x-forwarded-for'] ?? '')
        .split(',')[0]
        .trim() ||
      req?.ip ||
      'unknown';
    if (this.limited(ip))
      throw new HttpException(
        'Too many requests. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    // Bots fill every field; pretend success and store nothing.
    if (text(body?.website, 200)) return { ok: true };

    const name = text(body?.name, 120);
    const email = text(body?.email, 200).toLowerCase();
    const company = text(body?.company, 160);
    const teamSize = text(body?.teamSize, 20);
    const timeZones = text(body?.timeZones, 20);
    if (!name) throw new BadRequestException('Add your name.');
    if (!EMAIL_RE.test(email))
      throw new BadRequestException('Add a valid work email.');
    if (!company) throw new BadRequestException('Add your company.');
    if (!TEAM_SIZES.includes(teamSize))
      throw new BadRequestException('Pick a team size.');
    if (!TIME_ZONES.includes(timeZones))
      throw new BadRequestException('Pick how many time zones you span.');

    await this.requests.save(
      this.requests.create({
        name,
        email,
        company,
        teamSize,
        timeZones,
        role: text(body?.role, 80) || null,
        decision: text(body?.decision, 2000) || null,
        source: text(body?.source, 80) || null,
      }),
    );
    return { ok: true };
  }
}
