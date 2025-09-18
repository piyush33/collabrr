// src/homefeed/homefeed.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HomefeedService } from './homefeed.service';
import { Homefeed } from './homefeed.entity';
import { LayerGuard } from './layer.guard';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type CreateBody = Partial<Homefeed> & {
  allowedMemberIds?: number[]; // only used when visibility === 'team'
};

// @UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed')
export class HomefeedController {
  constructor(private readonly homefeedService: HomefeedService) {}

  /**
   * Main feed for a user inside an org (visibility-aware).
   * GET /orgs/:orgId/homefeed/user/:username?limit=50
   */
  @Get('user/:username')
  getHomeFeed(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const lim = Number(limit ?? 50) || 50;
    return this.homefeedService.getHomeFeed(orgId, username, lim);
  }

  /**
   * Fetch a single card, enforcing org + visibility.
   * GET /orgs/:orgId/homefeed/item/:id/user/:username
   * (If you use JWT, drop username and read from req.user)
   */
  @Get('item/:id/user/:username')
  findOne(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('username') username: string,
  ) {
    return this.homefeedService.findOne(orgId, id, username);
  }

  /**
   * Create a card (supports TEAM/LAYER visibility and team ACL).
   * POST /orgs/:orgId/homefeed/user/:username
   * Body: { ...homefeedFields, allowedMemberIds?: number[] }
   */
  @Post('user/:username')
  create(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
    @Body() body: CreateBody,
  ) {
    const { allowedMemberIds, ...card } = body;
    return this.homefeedService.create(orgId, username, card, {
      allowedMemberIds,
    });
  }

  /**
   * Update a card’s fields (author-only in the sample service).
   * PUT /orgs/:orgId/homefeed/item/:id/user/:username
   */
  @Put('item/:id/user/:username')
  update(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('username') username: string,
    @Body() patch: Partial<Homefeed>,
  ) {
    return this.homefeedService.update(orgId, id, username, patch);
  }

  /**
   * Delete a card (author-only in the sample service).
   * DELETE /orgs/:orgId/homefeed/item/:id/user/:username
   */
  @Delete('item/:id/user/:username')
  remove(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('username') username: string,
  ) {
    return this.homefeedService.remove(orgId, id, username);
  }

  // @UseGuards(LayerGuard)
  @Get('/layers/:layerId/cards')
  getLayerCards(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('layerId', ParseIntPipe) layerId: number,
    @Query('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const lim = Number(limit ?? 50) || 50;
    return this.homefeedService.getLayerFeed(orgId, username, layerId, lim);
  }
}
