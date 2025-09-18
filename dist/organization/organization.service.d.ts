import { Repository } from 'typeorm';
import { Organization, JoinPolicy } from './organization.entity';
import { OrganizationMember, OrgRole } from './organization-member.entity';
import { ProfileUser } from 'src/profileusers/profileuser.entity';
import { UsersService } from 'src/users/users.service';
export declare class OrganizationService {
    private orgRepo;
    private memberRepo;
    private profileRepo;
    private readonly usersService;
    constructor(orgRepo: Repository<Organization>, memberRepo: Repository<OrganizationMember>, profileRepo: Repository<ProfileUser>, usersService: UsersService);
    getBySlug(slug: string): Promise<{
        id: number;
        name: string;
        slug: string;
    }>;
    searchMembers(orgId: number, q?: string): Promise<{
        id: number;
        username: string;
        name: string;
        image: string;
    }[]>;
    getMembershipsForUsername(username: string): Promise<{
        organization: {
            id: number;
            name: string;
            slug: string;
        };
        role: OrgRole;
    }[]>;
    createOrgAsOwner(dto: {
        name: string;
        slug: string;
        joinPolicy?: JoinPolicy;
        allowedDomains?: string[];
    }, requester: {
        profileUserId?: number;
        username?: string;
    }): Promise<{
        id: number;
        name: string;
        slug: string;
    }>;
    private extractDomain;
    discoverByEmail(email: string): Promise<{
        id: number;
        name: string;
        slug: string;
    }[]>;
    joinOrgByPolicy(orgId: number, jwtUser: {
        sub: number;
        username: string;
    }): Promise<{
        ok: boolean;
    }>;
}
