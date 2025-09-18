import { OrganizationService } from './organization.service';
import { CreateOrgDto } from './dto/create-org.dto';
export declare class OrganizationController {
    private readonly orgService;
    constructor(orgService: OrganizationService);
    getBySlug(slug: string): Promise<{
        id: number;
        name: string;
        slug: string;
    }>;
    getMemberships(username: string): Promise<{
        organization: {
            id: number;
            name: string;
            slug: string;
        };
        role: import("./organization-member.entity").OrgRole;
    }[]>;
    createOrg(dto: CreateOrgDto, req: any): Promise<{
        id: number;
        name: string;
        slug: string;
    }>;
    discoverByEmail(email: string): Promise<{
        id: number;
        name: string;
        slug: string;
    }[]>;
    joinOrg(orgId: number, req: any): Promise<{
        ok: boolean;
    }>;
    listMembers(orgId: number, q?: string): Promise<{
        id: number;
        username: string;
        name: string;
        image: string;
    }[]>;
}
