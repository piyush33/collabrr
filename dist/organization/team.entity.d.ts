import { Organization } from 'src/organization/organization.entity';
import { TeamMember } from './team-member.entity';
export declare class Team {
    id: number;
    organization: Organization;
    name: string;
    description?: string;
    members: TeamMember[];
}
