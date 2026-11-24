export declare const SPACE_IDEAS_KIND = "space-ideas";
export declare const IDEAS_MIN_CARDS = 3;
export declare const IDEA_KINDS: string[];
export { normalizeCategory } from '../category';
export type FeedCard = {
    id: number;
    title?: string | null;
    description?: string | null;
    text?: string | null;
    category?: string | null;
    phase?: string | null;
    roleTypes?: string[] | null;
    createdAt?: Date | string | null;
    layer?: {
        id: number;
    } | null;
};
export type SpaceTopic = {
    topic?: string;
    tagline?: string;
};
export type IdeasTarget = {
    id: string;
    name: string;
    description?: string;
};
export declare class IdeasInputError extends Error {
}
export type PreparedIdeas = {
    target: IdeasTarget;
    spaces: ReturnType<typeof buildSpaces>;
    signature: string;
    cardCount: number;
};
declare function buildSpaces(cards: FeedCard[], topics: Map<number, SpaceTopic>, targetId: string): {
    space: string;
    spaceId: number;
    name: string;
    category: string;
    tagline: string;
    cardCount: number;
    phases: Record<string, number>;
    cards: {
        id: number;
        phase: string;
        roles: string[];
        title: string;
        description: string;
        text: string;
        date: string;
    }[];
}[];
export declare function prepareIdeas(model: string, target: IdeasTarget, cards: FeedCard[], topics: Map<number, SpaceTopic>): PreparedIdeas;
export declare function runIdeas(p: PreparedIdeas, apiKey: string, model: string): Promise<{
    category: {
        id: string;
        name: string;
    };
    ideas: {
        kind: string;
        spaceTopic: string;
        seedPhase: string;
        roleTypes: string[];
        title: string;
        description: string;
        text: string;
        rationale: string;
        sourceCardIds: number[];
        nextCards: {
            phase: string;
            roleType: string;
            title: string;
        }[];
    }[];
    sources: {
        [k: string]: {
            title: string;
            spaceId: number;
            spaceName: string;
            category: string;
        };
    };
    read: {
        spaces: number;
        cards: number;
        categories: number;
        spacesInCategory: number;
    };
    generatedAt: string;
}>;
