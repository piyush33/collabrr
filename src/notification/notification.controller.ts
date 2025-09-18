// src/notification/notification.controller.ts
import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
// import { UseGuards } from '@nestjs/common';
// import { OrgGuard } from 'src/auth/org.guard';
// import { LayerGuard } from 'src/auth/layer.guard';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Org-scoped notifications for a user (org members only).
   * GET /orgs/:orgId/notifications/user/:username
   */
  // @UseGuards(OrgGuard)
  @Get('orgs/:orgId/notifications/user/:username')
  async getOrgUserNotifications(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('username') username: string,
  ) {
    return this.notificationService.getOrgUserNotifications(orgId, username);
  }

  /**
   * Layer-scoped notifications for a user (layer guests allowed).
   * GET /layers/:layerId/notifications/user/:username
   */
  // @UseGuards(LayerGuard)
  @Get('layers/:layerId/notifications/user/:username')
  async getLayerUserNotifications(
    @Param('layerId', ParseIntPipe) layerId: number,
    @Param('username') username: string,
  ) {
    return this.notificationService.getLayerUserNotifications(
      layerId,
      username,
    );
  }

  @Get('orgs/:orgId/notifications/user/:username/unread-count')
  unreadCount(
    @Param('orgId') orgId: string,
    @Param('username') username: string,
  ) {
    return this.notificationService
      .getUnreadCount(+orgId, username)
      .then((n) => ({ count: n }));
  }

  @Post('orgs/:orgId/notifications/user/:username/mark-all-read')
  markAllRead(
    @Param('orgId') orgId: string,
    @Param('username') username: string,
  ) {
    return this.notificationService
      .markAllRead(+orgId, username)
      .then(() => ({ ok: true }));
  }

  @Post('orgs/:orgId/notifications/:id/mark-read/:username')
  markOneRead(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Param('username') username: string,
  ) {
    return this.notificationService
      .markOneRead(+orgId, username, +id)
      .then(() => ({ ok: true }));
  }
}
