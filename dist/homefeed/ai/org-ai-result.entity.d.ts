import { Organization } from 'src/organization/organization.entity';
export type OrgAiStatus = 'pending' | 'done' | 'error';
export declare class OrgAiResult {
    id: number;
    organization: Organization;
    kind: string;
    scope: string;
    signature: string;
    status: OrgAiStatus;
    model?: string | null;
    result?: Record<string, unknown> | null;
    error?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
