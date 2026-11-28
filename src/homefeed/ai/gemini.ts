// src/homefeed/ai/gemini.ts
// One structured-JSON Gemini call over REST (Node's built-in fetch).

export class AiError extends Error {}

export const geminiConfig = () => ({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});

export async function geminiJson<T>(opts: {
  apiKey: string;
  model: string;
  prompt: string;
  schema: object;
  temperature?: number;
  /** Gemini 2.5 "thinking" tokens; 0 turns it off (much faster). */
  thinkingBudget?: number;
  tag: string;
}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        opts.model,
      )}:generateContent`,
      {
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
      },
    );
  } catch (e) {
    console.error(`[${opts.tag}] network error`, e);
    throw new AiError('Could not reach the AI service.');
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(
      `[${opts.tag}] gemini error`,
      res.status,
      detail.slice(0, 500),
    );
    throw new AiError(`AI service error (${res.status}).`);
  }
  const json: any = await res.json().catch(() => null);
  const raw: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('');
  if (!raw) throw new AiError('AI returned an empty response.');
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new AiError('AI returned malformed output.');
  }
}

/**
 * A free-form (plain text) Gemini call, optionally grounded with Google
 * Search. Returns the reply and the web sources Gemini cited.
 */
export async function geminiText(opts: {
  apiKey: string;
  model: string;
  prompt: string;
  search?: boolean;
  temperature?: number;
  tag: string;
}): Promise<{ reply: string; sources: { title: string; url: string }[] }> {
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        opts.model,
      )}:generateContent`,
      {
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
      },
    );
  } catch (e) {
    console.error(`[${opts.tag}] network error`, e);
    throw new AiError('Could not reach the AI service.');
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(
      `[${opts.tag}] gemini error`,
      res.status,
      detail.slice(0, 500),
    );
    throw new AiError(`AI service error (${res.status}).`);
  }
  const json: any = await res.json().catch(() => null);
  const cand = json?.candidates?.[0];
  const reply: string = (cand?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();
  if (!reply) throw new AiError('AI returned an empty response.');
  const seen = new Set<string>();
  const sources: { title: string; url: string }[] = [];
  for (const ch of cand?.groundingMetadata?.groundingChunks ?? []) {
    const url = ch?.web?.uri;
    if (url && !seen.has(url)) {
      seen.add(url);
      sources.push({ title: String(ch.web.title || url), url });
    }
  }
  return { reply, sources: sources.slice(0, 8) };
}
