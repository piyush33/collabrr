import { Repository } from 'typeorm';
import { DesignPartnerRequest } from './design-partner-request.entity';
export declare class LeadsController {
    private readonly requests;
    private readonly hits;
    constructor(requests: Repository<DesignPartnerRequest>);
    private limited;
    create(body: Record<string, unknown>, req: any): Promise<{
        ok: boolean;
    }>;
}
