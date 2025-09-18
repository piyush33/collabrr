import { InvitationService } from './invitation.service';
import { CreateLayerInviteDto, CreateOrgInviteDto, AcceptInviteDto } from './invitation.dtos';
export declare class InvitationController {
    private readonly service;
    constructor(service: InvitationService);
    createOrgInvite(orgId: number, inviterId: number, dto: CreateOrgInviteDto): Promise<import("./invitation.entity").Invitation>;
    listOrgInvites(orgId: number): Promise<import("./invitation.entity").Invitation[]>;
    createLayerInvite(layerId: number, inviterId: number, dto: CreateLayerInviteDto): Promise<import("./invitation.entity").Invitation>;
    listLayerInvites(layerId: number): Promise<import("./invitation.entity").Invitation[]>;
    revoke(id: number, requesterId: number): Promise<import("./invitation.entity").Invitation>;
    resend(id: number, requesterId: number, hours?: string): Promise<import("./invitation.entity").Invitation>;
    preview(token: string): Promise<import("./invitation.entity").Invitation>;
    accept(body: AcceptInviteDto, acceptorId: number): Promise<{
        ok: boolean;
    }>;
}
