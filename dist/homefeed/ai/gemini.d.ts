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
export declare function geminiText(opts: {
    apiKey: string;
    model: string;
    prompt: string;
    search?: boolean;
    temperature?: number;
    tag: string;
}): Promise<{
    reply: string;
    sources: {
        title: string;
        url: string;
    }[];
}>;
