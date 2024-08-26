import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get(':username')
    async getUserNotifications(@Param('username') username: string) {
        return this.notificationService.getUserNotifications(username);
    }
}
