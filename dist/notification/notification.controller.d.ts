import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getOrgUserNotifications(orgId: number, username: string): Promise<import("./notification.entity").Notification[]>;
    getLayerUserNotifications(layerId: number, username: string): Promise<import("./notification.entity").Notification[]>;
    unreadCount(orgId: string, username: string): Promise<{
        count: number;
    }>;
    markAllRead(orgId: string, username: string): Promise<{
        ok: boolean;
    }>;
    markOneRead(orgId: string, id: string, username: string): Promise<{
        ok: boolean;
    }>;
}
