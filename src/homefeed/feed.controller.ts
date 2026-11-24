// src/homefeed/feed.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedQuery, FeedService } from './feed.service';

/**
 * Paged card feed. Identity comes from the JWT.
 *
 *   GET /orgs/:orgId/homefeed/feed?cursor&limit&category&phases&roles&q&from&to&content&author
 *       -> { items, nextCursor, total }
 *   GET /orgs/:orgId/homefeed/feed/categories -> { total, categories: [{ id, name, count }] }
 *   GET /orgs/:orgId/homefeed/feed/lookup?profileItemId&title&description&author -> { id, layerId }
 */
@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed/feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  private username(req: any): string {
    const u = req?.user?.username;
    if (!u) throw new UnauthorizedException();
    return u;
  }

  @Get()
  page(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query() query: FeedQuery,
    @Req() req: any,
  ) {
    return this.feed.page(orgId, this.username(req), query ?? {});
  }

  @Get('categories')
  categories(@Param('orgId', ParseIntPipe) orgId: number, @Req() req: any) {
    return this.feed.categories(orgId, this.username(req));
  }

  @Get('lookup')
  lookup(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query()
    query: {
      profileItemId?: string;
      title?: string;
      description?: string;
      author?: string;
    },
    @Req() req: any,
  ) {
    return this.feed.lookup(orgId, this.username(req), query ?? {});
  }
}
