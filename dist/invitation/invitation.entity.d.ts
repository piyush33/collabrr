import { Organization } from 'src/organization/organization.entity';
import { LinkedCardLayer } from 'src/homefeed/linked-card-layer.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare enum InviteScope {
    ORG = "org",
    LAYER = "layer"
}
export declare enum InviteStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
export declare class Invitation {
    id: number;
    scope: InviteScope;
    organization?: Organization;
    layer?: LinkedCardLayer;
    email: string;
    invitedBy?: ProfileUser;
    token: string;
    expiresAt: Date;
    status: InviteStatus;
}
