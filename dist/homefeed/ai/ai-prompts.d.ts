export type InCard = {
    id: number;
    title?: string;
    description?: string;
    text?: string;
    username?: string;
    phase?: string;
    roleTypes?: string[];
    createdAt?: string;
    weblink?: string;
};
export type SpaceBody = {
    category?: string;
    phases?: unknown;
    cards?: unknown;
    force?: boolean;
};
export type AiKind = 'summary' | 'suggestions';
export declare const AI_KINDS: AiKind[];
export declare const MAX_CARDS = 200;
export declare const ROLE_IDS: string[];
export declare const clip: (s: unknown, n?: number) => string;
export declare const compactCards: (cards: InCard[]) => {
    id: number;
    phase: string;
    title: string;
    description: string;
    text: string;
    author: string;
    roles: string[];
    date: string;
    link: boolean;
}[];
export type CompactCard = ReturnType<typeof compactCards>[number];
export declare const sha256: (v: unknown) => string;
export type Prepared = {
    kind: AiKind;
    category?: string;
    phases: string[];
    compact: CompactCard[];
    signature: string;
};
export declare class InputError extends Error {
}
export declare const SUGGEST_MIN_CARDS = 3;
export declare function prepare(kind: AiKind, model: string, body: SpaceBody): Prepared;
export declare const VOICE_GUIDE: string;
export declare const atRefs: (s: string, ids: Set<number>) => string;
export declare function generate(p: Prepared, apiKey: string, model: string): Promise<Record<string, unknown> | null>;
