// src/homefeed/ai/space-ideas.controller.ts
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
import { IdeasBody, SpaceIdeasService } from './space-ideas.service';

/**
 * New-space ideas for an Explore category, from every space the signed-in
 * user can see.
 *
 *   POST /orgs/:orgId/homefeed/ai/space-ideas   { category, categoryName?, categoryDescription?, force? }
 *   GET  /orgs/:orgId/homefeed/ai/space-ideas?category=<id>&signature=<sha256>
 *
 * Both return { status: 'done' | 'pending' | 'error' | 'missing', signature, result?, error? }.
 */
@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/homefeed/ai/space-ideas')
export class SpaceIdeasController {
  constructor(private readonly ideas: SpaceIdeasService) {}

  private username(req: any): string {
    const u = req?.user?.username;
    if (!u) throw new UnauthorizedException();
    return u;
  }

  @Post()
  @HttpCode(200)
  start(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() body: IdeasBody,
    @Req() req: any,
  ) {
    return this.ideas.start(orgId, this.username(req), body ?? {});
  }

  @Get()
  status(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('category') category: string,
    @Query('signature') signature: string,
    @Req() req: any,
  ) {
    return this.ideas.status(orgId, this.username(req), category, signature);
  }
}
