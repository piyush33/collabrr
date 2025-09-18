// src/invitation/invitation.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import {
  CreateLayerInviteDto,
  CreateOrgInviteDto,
  AcceptInviteDto,
} from './invitation.dtos';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller()
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  // ---- ORG invites ----
  @Post('orgs/:orgId/invites')
  createOrgInvite(
    @Param('orgId', ParseIntPipe) orgId: number,
    // @Req() req: any // if using JWT: const inviterId = req.user.profileUserId;
    @Query('inviterId', ParseIntPipe) inviterId: number, // temp for simplicity
    @Body() dto: CreateOrgInviteDto,
  ) {
    return this.service.createOrgInvite(orgId, inviterId, dto);
  }

  @Get('orgs/:orgId/invites')
  listOrgInvites(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.service.listOrgInvites(orgId);
  }

  // ---- LAYER invites ----
  @Post('layers/:layerId/invites')
  createLayerInvite(
    @Param('layerId', ParseIntPipe) layerId: number,
    @Query('inviterId', ParseIntPipe) inviterId: number,
    @Body() dto: CreateLayerInviteDto,
  ) {
    return this.service.createLayerInvite(layerId, inviterId, dto);
  }

  @Get('layers/:layerId/invites')
  listLayerInvites(@Param('layerId', ParseIntPipe) layerId: number) {
    return this.service.listLayerInvites(layerId);
  }

  // ---- Revoke / Resend ----
  @Post('invites/:id/revoke')
  revoke(
    @Param('id', ParseIntPipe) id: number,
    @Query('requesterId', ParseIntPipe) requesterId: number,
  ) {
    return this.service.revoke(id, requesterId);
  }

  @Post('invites/:id/resend')
  resend(
    @Param('id', ParseIntPipe) id: number,
    @Query('requesterId', ParseIntPipe) requesterId: number,
    @Query('hours') hours?: string,
  ) {
    const h = Number(hours || 168) || 168;
    return this.service.resend(id, requesterId, h);
  }

  // ---- Accept flow ----
  @Get('invites/preview')
  preview(@Query('token') token: string) {
    return this.service.previewByToken(token);
  }

  @Post('invites/accept')
  accept(
    @Body() body: AcceptInviteDto,
    @Query('acceptorId', ParseIntPipe) acceptorId: number, // replace with req.user.profileUserId in JWT
  ) {
    return this.service.accept(body.token, acceptorId);
  }
}
