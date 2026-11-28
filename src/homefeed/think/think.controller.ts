// src/homefeed/think/think.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { HomefeedService } from '../homefeed.service';
import { ThinkService } from './think.service';
import { ConvergeService } from './converge.service';

/**
 * Ask AI and Converge. Identity comes from the JWT.
 *
 *   POST /orgs/:orgId/homefeed/think/:kind            body → { id } (a background task)
 *   GET  /orgs/:orgId/homefeed/think/tasks/:id        → { status, result?, error? }
 *   GET  /orgs/:orgId/homefeed/layers/:layerId/converge
 *   POST /orgs/:orgId/homefeed/layers/:layerId/converge/vote   { pointId, position | null }
 *   POST /orgs/:orgId/homefeed/layers/:layerId/converge/timer  { pointId, op, durationMs? }
 */
@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed')
export class ThinkController {
  constructor(
    private readonly think: ThinkService,
    private readonly converge: ConvergeService,
    private readonly homefeed: HomefeedService,
  ) {}

  private username(req: any): string {
    const u = req?.user?.username;
    if (!u) throw new UnauthorizedException();
    return u;
  }

  @Post('think/:kind')
  @HttpCode(200)
  start(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('kind') kind: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.think.start(orgId, this.username(req), kind, body);
  }

  @Get('think/tasks/:id')
  task(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.think.get(orgId, this.username(req), id);
  }

  @Get('layers/:layerId/converge')
  async state(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Req() req: any,
  ) {
    await this.homefeed.assertLayerAccess(orgId, this.username(req), layerId);
    return this.converge.state(layerId);
  }

  @Post('layers/:layerId/converge/vote')
  @HttpCode(200)
  async vote(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Body() body: { pointId?: string; position?: number | null },
    @Req() req: any,
  ) {
    const username = this.username(req);
    await this.homefeed.assertLayerAccess(orgId, username, layerId);
    if (!body?.pointId) throw new BadRequestException('pointId is required');
    return this.converge.vote(
      layerId,
      username,
      String(body.pointId),
      body.position ?? null,
    );
  }

  @Post('layers/:layerId/converge/timer')
  @HttpCode(200)
  async timer(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Body() body: { pointId?: string; op?: string; durationMs?: number },
    @Req() req: any,
  ) {
    const username = this.username(req);
    await this.homefeed.assertLayerAccess(orgId, username, layerId);
    if (!body?.pointId || !body?.op)
      throw new BadRequestException('pointId and op are required');
    return this.converge.timer(
      layerId,
      username,
      String(body.pointId),
      String(body.op),
      body.durationMs,
    );
  }
}
