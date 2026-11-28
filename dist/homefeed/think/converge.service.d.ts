import { Repository } from 'typeorm';
import { ConvergePoint, ConvergeReading, ConvergeTimer, ConvergeVote } from './think.entities';
export type ConvergeState = {
    analysis: {
        points: ConvergePoint[];
        generatedAt: string;
        signature: string;
    } | null;
    votes: Record<string, Record<string, number>>;
    timers: Record<string, {
        deadline: number | null;
        remaining: number | null;
        running: boolean;
        setBy: string;
    }>;
};
type AiPoint = Omit<ConvergePoint, 'id'> & {
    previousId?: string;
};
export declare class ConvergeService {
    private readonly readings;
    private readonly votes;
    private readonly timers;
    constructor(readings: Repository<ConvergeReading>, votes: Repository<ConvergeVote>, timers: Repository<ConvergeTimer>);
    state(layerId: number): Promise<ConvergeState>;
    previousFor(layerId: number, mode: 'fresh' | 'update', convergedIds: string[]): Promise<{
        id: string;
        phase: string;
        question: string;
        positions: import("./think.entities").ConvergePosition[];
        locked: boolean;
        converged: boolean;
    }[]>;
    applyReading(layerId: number, mode: 'fresh' | 'update', aiPoints: AiPoint[], signature: string, convergedIds: string[]): Promise<ConvergeState>;
    private pointExists;
    vote(layerId: number, username: string, pointId: string, position: number | null): Promise<ConvergeState>;
    timer(layerId: number, username: string, pointId: string, op: string, durationMs?: number): Promise<ConvergeState>;
}
export {};
