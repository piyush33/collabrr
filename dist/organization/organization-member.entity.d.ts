import { Organization } from './organization.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
export declare enum OrgRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
    GUEST = "guest"
}
export declare class OrganizationMember {
    id: number;
    organization: Organization;
    user: ProfileUser;
    role: OrgRole;
    isActive: boolean;
}
