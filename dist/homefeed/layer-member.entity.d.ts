import { LinkedCardLayer } from './linked-card-layer.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare enum LayerRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
    VIEWER = "viewer"
}
export declare class LayerMember {
    id: number;
    layer: LinkedCardLayer;
    user: ProfileUser;
    role: LayerRole;
    isActive: boolean;
}
