import { LinkedCardLayer } from '../linked-card-layer.entity';
export type ThinkTaskStatus = 'pending' | 'done' | 'error';
export declare class ThinkTask {
    id: string;
    orgId: number;
    layerId: number | null;
    username: string;
    kind: string;
    status: ThinkTaskStatus;
    result: Record<string, unknown> | null;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export type ConvergePosition = {
    stance: string;
    summary: string;
    cardIds: number[];
};
export type ConvergePoint = {
    id: string;
    phase: string;
    question: string;
    status: string;
    positions: ConvergePosition[];
    missing: string;
    leaning: string;
};
export declare class ConvergeReading {
    id: number;
    layer: LinkedCardLayer;
    points: ConvergePoint[];
    signature: string;
    updatedAt: Date;
}
export declare class ConvergeVote {
    id: number;
    layer: LinkedCardLayer;
    pointId: string;
    username: string;
    position: number;
    updatedAt: Date;
}
export declare class ConvergeTimer {
    id: number;
    layer: LinkedCardLayer;
    pointId: string;
    deadline: Date | null;
    remainingMs: string | null;
    running: boolean;
    setBy: string;
}
