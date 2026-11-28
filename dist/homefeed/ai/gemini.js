"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiConfig = exports.AiError = void 0;
exports.geminiJson = geminiJson;
exports.geminiText = geminiText;
class AiError extends Error {
}
exports.AiError = AiError;
const geminiConfig = () => ({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});
exports.geminiConfig = geminiConfig;
async function geminiJson(opts) {
    let res;
    try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': opts.apiKey,
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
                generationConfig: {
                    temperature: opts.temperature ?? 0.4,
                    responseMimeType: 'application/json',
                    responseSchema: opts.schema,
                    ...(opts.thinkingBudget !== undefined && {
                        thinkingConfig: { thinkingBudget: opts.thinkingBudget },
                    }),
                },
            }),
            signal: AbortSignal.timeout(110_000),
        });
    }
    catch (e) {
        console.error(`[${opts.tag}] network error`, e);
        throw new AiError('Could not reach the AI service.');
    }
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`[${opts.tag}] gemini error`, res.status, detail.slice(0, 500));
        throw new AiError(`AI service error (${res.status}).`);
    }
    const json = await res.json().catch(() => null);
    const raw = json?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? '')
        .join('');
    if (!raw)
        throw new AiError('AI returned an empty response.');
    try {
        return JSON.parse(raw);
    }
    catch {
        throw new AiError('AI returned malformed output.');
    }
}
async function geminiText(opts) {
    let res;
    try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': opts.apiKey,
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
                ...(opts.search ? { tools: [{ google_search: {} }] } : {}),
                generationConfig: {
                    temperature: opts.temperature ?? 0.5,
                    thinkingConfig: { thinkingBudget: 0 },
                },
            }),
            signal: AbortSignal.timeout(110_000),
        });
    }
    catch (e) {
        console.error(`[${opts.tag}] network error`, e);
        throw new AiError('Could not reach the AI service.');
    }
    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`[${opts.tag}] gemini error`, res.status, detail.slice(0, 500));
        throw new AiError(`AI service error (${res.status}).`);
    }
    const json = await res.json().catch(() => null);
    const cand = json?.candidates?.[0];
    const reply = (cand?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();
    if (!reply)
        throw new AiError('AI returned an empty response.');
    const seen = new Set();
    const sources = [];
    for (const ch of cand?.groundingMetadata?.groundingChunks ?? []) {
        const url = ch?.web?.uri;
        if (url && !seen.has(url)) {
            seen.add(url);
            sources.push({ title: String(ch.web.title || url), url });
        }
    }
    return { reply, sources: sources.slice(0, 8) };
}
//# sourceMappingURL=gemini.js.map