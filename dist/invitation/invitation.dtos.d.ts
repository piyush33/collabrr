import { OrgRole } from 'src/organization/organization-member.entity';
export declare class CreateOrgInviteDto {
    email: string;
    role?: OrgRole;
    expiresInHours?: number;
}
export declare class CreateLayerInviteDto {
    email: string;
    expiresInHours?: number;
}
export declare class AcceptInviteDto {
    token: string;
}
