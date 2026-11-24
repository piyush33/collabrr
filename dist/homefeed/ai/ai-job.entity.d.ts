import { LinkedCardLayer } from '../linked-card-layer.entity';
export type AiJobStatus = 'pending' | 'done' | 'error';
export declare class AiJob {
    id: number;
    layer: LinkedCardLayer;
    kind: string;
    signature: string;
    status: AiJobStatus;
    error?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
