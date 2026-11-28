export declare const PHASE_GUIDE = "\"phase\" places the card in the team's workflow by what the card itself does, not by the cards it links to:\n- seed-initial-discuss: a new question, raw idea or problem framing\n- discovery-brainstorm: research, evidence, user insight, exploring possibilities\n- hypothesis-options: a claim, counter-claim, option or proposal to test\n- specs-solutioning: how to build it, requirements, design or technical detail\n- decision: only when it settles a choice between options, with the reasoning\n- task-execution: a concrete task, blocker or status of work in progress\n- documentation-narrative: a write-up of what was decided or built\n- retro-learning: what went well or badly, lessons after the fact\n- backlog: parked for later\nMost new thinking belongs in seed, discovery, hypothesis or specs; use decision rarely.";
export type CardIn = {
    id: number;
    title?: string;
    description?: string;
    text?: string;
    username?: string;
    phase?: string;
    roleTypes?: string[];
};
export type Msg = {
    role: 'user' | 'ai';
    text: string;
};
export type RefCard = CardIn & {
    category?: string;
    spaceId?: number | null;
};
export declare function chatCard(body: {
    category?: string;
    cards: CardIn[];
    anchorId: number;
    suggestion: Record<string, unknown>;
    messages: Msg[];
    refCards?: RefCard[];
    note?: string;
}): Promise<unknown>;
export declare function chatSpace(body: {
    category?: string;
    cards: CardIn[];
    topic?: string;
    messages: Msg[];
    refCards?: RefCard[];
    note?: string;
}): Promise<unknown>;
export type IdeaIn = {
    spaceTopic?: string;
    title?: string;
    description?: string;
    text?: string;
    rationale?: string;
    sourceCardIds?: number[];
    category?: string;
};
export declare function chatWide(body: {
    scope: 'idea' | 'org' | 'web' | 'general';
    idea?: IdeaIn;
    category?: string;
    topic?: string;
    cards: CardIn[];
    orgCards?: (CardIn & {
        category?: string;
    })[];
    messages: Msg[];
    refCards?: RefCard[];
    note?: string;
}): Promise<{
    cardIds: any[];
    reply: string;
    sources: {
        title: string;
        url: string;
    }[];
} | {
    sources: any[];
    reply: string;
    cardIds: number[];
}>;
export declare function toCard(body: {
    category?: string;
    cards: CardIn[];
    topic?: string;
    messages: Msg[];
    focus?: string;
    refCards?: RefCard[];
    idea?: IdeaIn;
    note?: string;
}): Promise<unknown>;
export declare function converge(body: {
    category?: string;
    cards: CardIn[];
    topic?: string;
    phases?: string[];
    previous?: {
        id: string;
        phase: string;
        question: string;
        positions: {
            stance: string;
        }[];
        locked?: boolean;
        converged?: boolean;
    }[];
}): Promise<unknown>;
export declare function decide(body: {
    category?: string;
    cards: CardIn[];
    point: {
        question: string;
        phase?: string;
        positions: {
            stance: string;
            summary: string;
            cardIds: number[];
        }[];
        missing?: string;
    };
    choice?: string;
    votes?: {
        stance: string;
        voters: string[];
    }[];
    participants?: number;
}): Promise<unknown>;
export declare function callOutcome(body: {
    category?: string;
    cards: CardIn[];
    topic?: string;
    agenda?: {
        goal?: string;
        items?: string[];
    };
    question?: string;
    notes: string;
}): Promise<unknown>;
