"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASE_GUIDE = void 0;
exports.chatCard = chatCard;
exports.chatSpace = chatSpace;
exports.chatWide = chatWide;
exports.toCard = toCard;
exports.converge = converge;
exports.decide = decide;
exports.callOutcome = callOutcome;
const gemini_1 = require("../ai/gemini");
const ai_prompts_1 = require("../ai/ai-prompts");
const PHASE_IDS = [
    'backlog',
    'seed-initial-discuss',
    'discovery-brainstorm',
    'hypothesis-options',
    'specs-solutioning',
    'decision',
    'task-execution',
    'documentation-narrative',
    'retro-learning',
];
exports.PHASE_GUIDE = `"phase" places the card in the team's workflow by what the card itself does, not by the cards it links to:
- seed-initial-discuss: a new question, raw idea or problem framing
- discovery-brainstorm: research, evidence, user insight, exploring possibilities
- hypothesis-options: a claim, counter-claim, option or proposal to test
- specs-solutioning: how to build it, requirements, design or technical detail
- decision: only when it settles a choice between options, with the reasoning
- task-execution: a concrete task, blocker or status of work in progress
- documentation-narrative: a write-up of what was decided or built
- retro-learning: what went well or badly, lessons after the fact
- backlog: parked for later
Most new thinking belongs in seed, discovery, hypothesis or specs; use decision rarely.`;
const MAX_CARDS = 200;
const MAX_FIELD = 500;
const clip = (s, n = MAX_FIELD) => {
    const t = String(s ?? '')
        .replace(/\s+/g, ' ')
        .trim();
    return t.length > n ? `${t.slice(0, n)}…` : t;
};
const cardLines = (cards) => cards
    .slice(0, MAX_CARDS)
    .map((c) => {
    const roles = c.roleTypes?.length ? ` (${c.roleTypes.join(', ')})` : '';
    const body = [clip(c.title, 200), clip(c.description, 300), clip(c.text)]
        .filter(Boolean)
        .join(' | ');
    return `@${c.id} [${c.phase ?? '?'}]${roles} @${c.username ?? '?'}: ${body}`;
})
    .join('\n');
async function gemini(prompt, schema, temperature = 0.4, tag = 'think') {
    const { apiKey, model } = (0, gemini_1.geminiConfig)();
    if (!apiKey)
        throw new gemini_1.AiError('AI is not configured.');
    return (0, gemini_1.geminiJson)({
        apiKey,
        model,
        prompt,
        schema,
        temperature,
        thinkingBudget: 0,
        tag,
    });
}
async function geminiText(prompt, opts = {}) {
    const { apiKey, model } = (0, gemini_1.geminiConfig)();
    if (!apiKey)
        throw new gemini_1.AiError('AI is not configured.');
    return (0, gemini_1.geminiText)({
        apiKey,
        model,
        prompt,
        search: opts.search,
        temperature: opts.temperature,
        tag: 'think',
    });
}
const SUGGESTION_SCHEMA = {
    type: 'object',
    properties: {
        phase: { type: 'string', enum: PHASE_IDS },
        title: { type: 'string' },
        description: { type: 'string' },
        text: { type: 'string' },
        roleTypes: { type: 'array', items: { type: 'string', enum: ai_prompts_1.ROLE_IDS } },
        rationale: { type: 'string' },
        relatedCardIds: { type: 'array', items: { type: 'integer' } },
    },
    required: [
        'phase',
        'title',
        'description',
        'text',
        'roleTypes',
        'rationale',
        'relatedCardIds',
    ],
};
const VOICE = `Write like a sharp colleague on a distributed product team: plain, specific, no hype, no filler.
Reference cards as @<id> only when you mean that exact card. Never invent facts, numbers or card ids that are not in the cards.`;
const noteBlock = (note) => note
    ? `\nWhat the person is looking at right now:\n${clip(note, 4000)}\n`
    : '';
const refBlock = (refs) => refs?.length
    ? `\nCards mentioned in the conversation (from across the workspace; {category} space #id):\n${refs
        .slice(0, 12)
        .map((c) => `@${c.id} {${clip(c.category, 40) || 'uncategorised'}}${c.spaceId ? ` space #${c.spaceId}` : ''} [${c.phase ?? '?'}] @${c.username ?? '?'}: ${[clip(c.title, 200), clip(c.description, 300), clip(c.text, 600)].filter(Boolean).join(' | ')}`)
        .join('\n')}\n`
    : '';
const transcript = (messages) => messages
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Person' : 'AI'}: ${clip(m.text, 800)}`)
    .join('\n');
async function chatCard(body) {
    const prompt = `You are a thinking partner inside a team's discussion space (category: ${clip(body.category, 60)}).
${VOICE}

The space's cards:
${cardLines(body.cards)}

${refBlock(body.refCards)}${noteBlock(body.note)}
You suggested this next card, in response to @${body.anchorId}:
${JSON.stringify(body.suggestion)}

The person is chatting with you about it before anything goes into the space:
${transcript(body.messages)}

Work in this order:
1. "wantsChange": true if their last message asks to change the card in any way (a different role such as mitigation or evidence, sharper, shorter, a new angle, "make it…", "turn it into…"), else false.
2. "card": if wantsChange, the card with that change applied exactly as asked: rewrite title, description and text for it, and set "roleTypes" to match a requested role. Otherwise, a better card only if your reply leads to one, else null. One card, one job. "rationale": one sentence on why it moves the discussion forward. "relatedCardIds": existing cards it responds to.
   ${exports.PHASE_GUIDE}
3. "reply": your conversational answer, under 90 words. Think with them: question assumptions, point to cards (@id), say what is missing. If you made a change you disagree with, you may say so here.`;
    return gemini(prompt, {
        type: 'object',
        properties: {
            wantsChange: { type: 'boolean' },
            card: { ...SUGGESTION_SCHEMA, nullable: true },
            reply: { type: 'string' },
        },
        required: ['wantsChange', 'reply'],
        propertyOrdering: ['wantsChange', 'card', 'reply'],
    }, 0.5);
}
async function chatSpace(body) {
    const prompt = `You are a thinking partner for one discussion space made of cards (category: ${clip(body.category, 60)}${body.topic ? `, topic: ${clip(body.topic, 120)}` : ''}).
${VOICE}
Ground what you say in the cards. If the cards don't settle something, say what is missing. Under 120 words; short paragraphs or a few "- " bullets.

The cards:
${cardLines(body.cards)}
${refBlock(body.refCards)}${noteBlock(body.note)}
The conversation so far (nothing here is in the space yet):
${transcript(body.messages)}

Reply to the person's last message. "cardIds" lists the cards your reply relies on most (at most 6).`;
    return gemini(prompt, {
        type: 'object',
        properties: {
            reply: { type: 'string' },
            cardIds: { type: 'array', items: { type: 'integer' } },
        },
        required: ['reply', 'cardIds'],
    }, 0.4);
}
const ideaBlock = (idea) => idea
    ? `A SUGGESTED NEW SPACE the person is considering (not started yet)${idea.category ? `, category ${clip(idea.category, 60)}` : ''}:
Topic: ${clip(idea.spaceTopic, 160)}
Opening card: ${[clip(idea.title, 200), clip(idea.description, 300), clip(idea.text, 600)].filter(Boolean).join(' | ')}
Why suggested: ${clip(idea.rationale, 400)}${idea.sourceCardIds?.length ? `\nDrawn from cards: ${idea.sourceCardIds.map((id) => `@${id}`).join(', ')}` : ''}\n`
    : '';
async function chatWide(body) {
    const inSpace = new Set(body.cards.map((c) => c.id));
    const others = (body.orgCards ?? [])
        .filter((c) => !inSpace.has(c.id))
        .slice(0, MAX_CARDS);
    const orgLines = others
        .map((c) => `@${c.id} {${clip(c.category, 40) || 'uncategorised'}} [${c.phase ?? '?'}] @${c.username ?? '?'}: ${[clip(c.title, 160), clip(c.description, 200), clip(c.text, 300)].filter(Boolean).join(' | ')}`)
        .join('\n');
    const parts = [
        body.cards.length
            ? `THIS SPACE${body.topic ? ` ("${clip(body.topic, 120)}", category ${clip(body.category, 60)})` : ''}, cards as @id [phase] (roles) @author:\n${cardLines(body.cards)}`
            : '',
        orgLines
            ? `OTHER SPACES IN THE WORKSPACE, recent cards as @id {category} [phase] @author:\n${orgLines}`
            : '',
        refBlock(body.refCards).trim(),
        ideaBlock(body.idea).trim(),
        noteBlock(body.note).trim(),
    ].filter(Boolean);
    const hasCards = parts.length > 0;
    const context = hasCards
        ? `The team's cards they referred to:\n${parts.join('\n\n')}\n`
        : '';
    const rules = `${VOICE}
${hasCards
        ? 'Use the cards above because the person referred to them; cite them only by their real number, like @142. Never make up card ids or names.'
        : "The person asked a general question: answer it on its own terms. Don't mention or cite any team cards or spaces."}
Reply conversationally, under 170 words; short paragraphs or a few "- " bullets. Plain text, no markdown headings or bold. No greetings or sign-offs.`;
    const convo = `Conversation (nothing here is posted):\n${transcript(body.messages)}\n\nReply to the person's last message.`;
    if (body.scope === 'idea') {
        const prompt = `You are a thinking partner helping someone decide whether and how to start a new discussion space in their team's workspace.
Think the idea through with them: is it worth a space, what the sharpest opening question is, who should be involved, what already exists in other spaces (cite cards as @id), what could go wrong. Be candid; it's fine to say the idea needs reshaping.
If they ask to change the opening card, describe the change; they can turn your reply into the new opening card.
${rules}

${context}
${convo}`;
        return {
            ...(await geminiText(prompt, { search: true, temperature: 0.5 })),
            cardIds: [],
        };
    }
    if (body.scope === 'org') {
        const prompt = `You are a thinking partner across a whole team workspace: many discussion spaces, each made of cards.
Lean on the workspace: where an idea already comes up, what it connects to or conflicts with, who has been thinking about it, what is missing. If the workspace has nothing on it, say so plainly.
${rules}

${context}
${convo}`;
        const r = await gemini(prompt, {
            type: 'object',
            properties: {
                reply: { type: 'string' },
                cardIds: { type: 'array', items: { type: 'integer' } },
            },
            required: ['reply', 'cardIds'],
        }, 0.4);
        return { ...r, sources: [] };
    }
    if (body.scope === 'web') {
        const prompt = `You are a research partner for a product team. Research the question on the web and bring back what you find: specific, current, honest about uncertainty, saying in plain words where a claim comes from.${hasCards
            ? '\nRelate the findings to the cards below, which the person referred to; the new information comes from the web.'
            : ''}
${rules}

${context}
${convo}`;
        return {
            ...(await geminiText(prompt, { search: true, temperature: 0.3 })),
            cardIds: [],
        };
    }
    const prompt = `You are a thoughtful, plain-spoken thinking partner with broad knowledge and Google Search.
Search the web whenever the person asks for links, websites, articles, blogs, examples, tools, prices, or anything current or factual you aren't sure of; then answer with what you found and name the actual pages or publications. Otherwise just think with them.${hasCards
        ? "\nThe person referred to their team's cards below: build on what was said (e.g. in a phase such as Seed / Initial Discuss), point out gaps and things they haven't discussed, and cite cards as @id."
        : ''}
${rules}

${context}
${convo}`;
    return {
        ...(await geminiText(prompt, { search: true, temperature: 0.6 })),
        cardIds: [],
    };
}
async function toCard(body) {
    const prompt = `A person has been thinking with an AI about a discussion space (category: ${clip(body.category, 60)}${body.topic ? `, topic: ${clip(body.topic, 120)}` : ''}). Now they want to add the result to the space as one card.
${VOICE}

The space's cards:
${cardLines(body.cards) || '(none: this card will open a new space)'}
${refBlock(body.refCards)}${ideaBlock(body.idea)}${noteBlock(body.note)}
The conversation:
${transcript(body.messages)}
${body.focus ? `\nBuild the card mainly from this reply:\n${clip(body.focus, 1200)}\n` : ''}
Write one card that does one job (a question, claim, evidence, risk, mitigation, decision rationale…), in the person's voice, not the AI's.
The "title" states the card's point itself (the claim, the question that is still open, the risk), never the person's chat question or a meta line like "What's blocking a decision?".
"rationale" says in one sentence why it moves the discussion forward. "relatedCardIds" are existing cards it responds to, most relevant first.
${exports.PHASE_GUIDE}`;
    return gemini(prompt, SUGGESTION_SCHEMA, 0.4);
}
async function converge(body) {
    const phaseNames = [...(body.phases ?? []), 'Across phases'];
    const settled = body.cards.filter((c) => /decision/i.test(c.phase ?? '') ||
        (c.roleTypes ?? []).includes('decision-rationale'));
    const settledBlock = settled.length
        ? `\nALREADY SETTLED. These cards record choices the team has made; any tension they decide is closed, even if earlier cards argued the other way. Do not list it again, and don't cite these cards as one side of an open point:\n${settled
            .map((c) => `@${c.id}: ${clip(c.title, 200)}${c.description ? ` (${clip(c.description, 200)})` : ''}`)
            .join('\n')}\n`
        : '';
    const prev = body.previous ?? [];
    const prevBlock = prev.length
        ? `\nPoints that were open when the space was last read (id: question [positions]):\n${prev
            .map((p) => `${p.id}${p.locked ? ' [LOCKED]' : ''}: ${clip(p.question, 200)} [${p.positions.map((x) => clip(x.stance, 80)).join(' | ')}]`)
            .join('\n')}\n
For each of these: if a card now settles it (a decision or convergence card on it, or the team clearly agreeing), DROP it. If it is still open, return it with "previousId" set to its id. Never return a settled point.
[LOCKED] points have votes or a timer on them: unless a card settles them, ALWAYS return them with their previousId, as the same single point. Don't reword, split or merge them, and don't raise a new point that duplicates one.`
        : '';
    const prompt = `You help a distributed team converge on decisions without a meeting. The space (category: ${clip(body.category, 60)}${body.topic ? `, topic: ${clip(body.topic, 120)}` : ''}) is made of cards:
${cardLines(body.cards)}

${VOICE}
${settledBlock}${prevBlock}
Find the points where the team still needs to converge: cards disagree, options compete, or a choice is open with at least two perspectives. Only real ones; if nothing needs converging, return no points. At most 6, most important first. New points get "previousId": "".
For each point:
- "phase": the phase the point belongs to, exactly one of ${JSON.stringify(phaseNames)} ("Across phases" when it spans several).
- "question": the decision to make, as one plain question.
- "status": "split" (real disagreement), "leaning" (most evidence points one way), or "open" (not enough input yet).
- "positions": 2 or 3 positions actually taken in the cards, each with a short "stance" (under 12 words), a one-sentence "summary" and the "cardIds" that support it. Only positions that are in the cards.
- "missing": what evidence or input would settle it, in one sentence.
- "leaning": if status is "leaning", which position and why in one sentence; else "".`;
    return gemini(prompt, {
        type: 'object',
        properties: {
            points: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        previousId: { type: 'string' },
                        phase: { type: 'string', enum: phaseNames },
                        question: { type: 'string' },
                        status: { type: 'string', enum: ['split', 'leaning', 'open'] },
                        positions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    stance: { type: 'string' },
                                    summary: { type: 'string' },
                                    cardIds: { type: 'array', items: { type: 'integer' } },
                                },
                                required: ['stance', 'summary', 'cardIds'],
                            },
                        },
                        missing: { type: 'string' },
                        leaning: { type: 'string' },
                    },
                    required: [
                        'previousId',
                        'phase',
                        'question',
                        'status',
                        'positions',
                        'missing',
                        'leaning',
                    ],
                },
            },
        },
        required: ['points'],
    }, 0.3);
}
async function decide(body) {
    const tally = (body.votes ?? [])
        .map((v) => `${v.stance}: ${v.voters.length} (${v.voters.map((u) => `@${u}`).join(', ') || 'none'})`)
        .join('; ');
    const voted = (body.votes ?? []).reduce((n, v) => n + v.voters.length, 0);
    const prompt = `A distributed team is converging on one decision in their discussion space (category: ${clip(body.category, 60)}).
${VOICE}

The cards:
${cardLines(body.cards)}

The decision: "${clip(body.point.question, 300)}"
Positions: ${JSON.stringify(body.point.positions)}
${body.choice ? `The team converged on: "${clip(body.choice, 200)}"` : 'Pick the position the evidence supports best, or a combination if that is clearly better.'}
${tally ? `Votes from the ${body.participants ?? '?'} people who contributed to this ${body.point.phase && body.point.phase !== 'Across phases' ? `phase (${body.point.phase})` : 'space'}: ${tally}. ${voted} of ${body.participants ?? '?'} voted.` : ''}

Write two things:
1. "decision": the convergence card. It must answer exactly this point's question ("${clip(body.point.question, 300)}") and nothing else: don't settle other questions in the space, even ones the same cards touch. "title" states what the team converged on for this question, in one line. "description" says what changes. "text" gives the reasoning in 2-4 short sentences citing the cards (@id), and reflects the balance of the vote honestly: say how many of the participants backed it (e.g. "Backed by 3 of 5 contributors"), and name the dissenting view and how it is handled. "roleTypes" fit what it is (often ["decision-rationale"], but e.g. ["mitigation"] or ["claim"] if that's what it is). "rationale" says why this converged. "relatedCardIds" are the cards it rests on.
   ${exports.PHASE_GUIDE}
   Convergence doesn't always mean the Decision phase. Choose "phase" by what the team converged on:
   - decision: ONLY when it commits the team to a course of action (we will / we won't do X).
   - discovery-brainstorm or hypothesis-options: agreement on a fact, risk, constraint, assumption or which options are still on the table.
   - specs-solutioning: agreement on how to build or solve it.
   - task-execution: agreement on who does what next.
   Often that is the point's own phase or the next one.
2. "agenda": in case the team is still split, a focused 15-minute call on this point only. "goal" in one sentence, 3 "items" (each a short line), and "prereadCardIds" (at most 5).`;
    return gemini(prompt, {
        type: 'object',
        properties: {
            decision: {
                ...SUGGESTION_SCHEMA,
                propertyOrdering: [
                    'phase',
                    'title',
                    'description',
                    'text',
                    'roleTypes',
                    'rationale',
                    'relatedCardIds',
                ],
            },
            agenda: {
                type: 'object',
                properties: {
                    goal: { type: 'string' },
                    items: { type: 'array', items: { type: 'string' } },
                    prereadCardIds: { type: 'array', items: { type: 'integer' } },
                },
                required: ['goal', 'items', 'prereadCardIds'],
            },
        },
        required: ['decision', 'agenda'],
    }, 0.35);
}
async function callOutcome(body) {
    const prompt = `A distributed team just had a short call${body.question ? ` about: "${clip(body.question, 300)}"` : ''} in their discussion space (category: ${clip(body.category, 60)}${body.topic ? `, topic: ${clip(body.topic, 120)}` : ''}). Bring the outcome back into the space as one card.
${VOICE}

The space's cards:
${cardLines(body.cards)}
${body.agenda?.goal ? `\nThe call's agenda: ${clip(body.agenda.goal, 300)}${(body.agenda.items ?? []).map((it) => `\n- ${clip(it, 200)}`).join('')}\n` : ''}
Notes from the call:
${clip(body.notes, 3000)}

Write one card capturing what the call settled or changed, in the team's voice. "text" says what was agreed and why in 2-4 sentences, citing related cards as @id, and notes anything left open. Mention it came out of a call.
${exports.PHASE_GUIDE}
Pick the phase by what the outcome is: a commitment to act is decision; agreement on facts, risks or options is discovery/hypothesis; on how to build, specs; on who does what, task-execution.`;
    return gemini(prompt, {
        ...SUGGESTION_SCHEMA,
        propertyOrdering: [
            'phase',
            'title',
            'description',
            'text',
            'roleTypes',
            'rationale',
            'relatedCardIds',
        ],
    }, 0.35);
}
//# sourceMappingURL=think-prompts.js.map