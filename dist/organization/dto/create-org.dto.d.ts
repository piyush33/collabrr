import { JoinPolicy } from '../organization.entity';
export declare class CreateOrgDto {
    name: string;
    slug: string;
    joinPolicy?: JoinPolicy;
    allowedDomains?: string[];
}
