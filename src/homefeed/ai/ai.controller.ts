// src/homefeed/ai/ai.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import type { SpaceBody } from './ai-prompts';

/**
 * AI features for a layer (kind = "summary" | "suggestions"). Identity
 * comes from the JWT; access follows the rules for reading the layer.
 *
 *   POST /orgs/:orgId/homefeed/layers/:layerId/ai/:kind   { category, phases, cards, force }
 *   GET  /orgs/:orgId/homefeed/layers/:layerId/ai/:kind?signature=<sha256>
 *
 * Both return { status: 'done' | 'pending' | 'error' | 'missing', signature, result?, error? }.
 */
@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed/layers/:layerId/ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  private username(req: any): string {
    const u = req?.user?.username;
    if (!u) throw new UnauthorizedException();
    return u;
  }

  @Post(':kind')
  @HttpCode(200)
  start(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('kind') kind: string,
    @Body() body: SpaceBody,
    @Req() req: any,
  ) {
    return this.ai.start(orgId, layerId, this.username(req), kind, body);
  }

  @Get(':kind')
  status(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('kind') kind: string,
    @Query('signature') signature: string,
    @Req() req: any,
  ) {
    return this.ai.status(orgId, layerId, this.username(req), kind, signature);
  }
}
