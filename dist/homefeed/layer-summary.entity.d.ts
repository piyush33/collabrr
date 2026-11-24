import { LinkedCardLayer } from './linked-card-layer.entity';
export declare class LayerSummary {
    id: number;
    layer: LinkedCardLayer;
    signature: string;
    model?: string;
    summary: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
