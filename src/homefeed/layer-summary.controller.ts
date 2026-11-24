// src/homefeed/layer-summary.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LayerSummaryService } from './layer-summary.service';

/**
 * Saved AI summaries of a layer. Identity always comes from the JWT,
 * never from the request, and access follows the same rules as reading
 * the layer's cards.
 */
@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed/layers/:layerId/summary')
export class LayerSummaryController {
  constructor(private readonly summaries: LayerSummaryService) {}

  private username(req: any): string {
    const u = req?.user?.username;
    if (!u) throw new UnauthorizedException();
    return u;
  }

  /** GET /orgs/:orgId/homefeed/layers/:layerId/summary?signature=<sha256> */
  @Get()
  get(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Query('signature') signature: string,
    @Req() req: any,
  ) {
    return this.summaries.get(orgId, layerId, this.username(req), signature);
  }

  /** PUT /orgs/:orgId/homefeed/layers/:layerId/summary  { signature, model, summary } */
  @Put()
  save(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Body() body: { signature?: unknown; model?: unknown; summary?: unknown },
    @Req() req: any,
  ) {
    return this.summaries.save(orgId, layerId, this.username(req), body);
  }
}
