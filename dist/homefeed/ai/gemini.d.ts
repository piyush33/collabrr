export declare class AiError extends Error {
}
export declare const geminiConfig: () => {
    apiKey: string;
    model: string;
};
export declare function geminiJson<T>(opts: {
    apiKey: string;
    model: string;
    prompt: string;
    schema: object;
    temperature?: number;
    thinkingBudget?: number;
    tag: string;
}): Promise<T>;
