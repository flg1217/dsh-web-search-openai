/**
 * OpenAI search through the Responses API with the native `web_search` server
 * tool. Each search runs a server-side retrieval that also generates an
 * answer; the structured `web_search_call` results (or, failing those, the
 * message `url_citation` annotations) become the citeable sources and the
 * generated answer becomes `content`. The wire format and native `fetch` client
 * are provider-private and do not use `ctx.llm`.
 * @module @dsh-external/dsh-web-search-openai/provider
 */
import type { WebSearchProvider, WebSearchRequest, WebSearchResult } from '@deepseek-ai/dsh-web';
import type { OpenAiResponsesResponse } from './types.ts';
/** Stable id this provider registers under. */
export declare const OPENAI_PROVIDER_ID = "openai";
/** Default endpoint: the public OpenAI Responses API, `/v1` included (`/responses` is appended). */
export declare const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";
/** Default model name. Deployment-specific; a Codex reverse proxy names its own model. */
export declare const OPENAI_DEFAULT_MODEL = "gpt-5.6-luna";
/** Default upper bound on generated output tokens for the Responses request. */
export declare const OPENAI_DEFAULT_MAX_TOKENS = 128000;
/** Default `web_search` retrieval context size. */
export declare const OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE = "medium";
/** 请求超时(ms):OpenAI API 挂起(网络黑洞)时不能无限等待。
 * 与 CLI 型执行器(AGY/CodeBuddy 的空闲超时)哲学一致:长时间无响应即判定
 * 卡死并明确报错;正常检索一般 15-90 秒,120s 窗口足够宽松。 */
export declare const OPENAI_DEFAULT_REQUEST_TIMEOUT_MS = 120000;
/** Resolved provider options (the plugin's `apply` supplies env-var and constant defaults). */
export interface OpenAiSearchProviderOptions {
    /** OpenAI API key. Empty/absent makes the provider unavailable. */
    apiKey: string;
    /** Endpoint base; `/responses` is appended. */
    baseURL: string;
    /** Responses API model name. */
    model: string;
    /** Upper bound on generated output tokens. */
    maxTokens: number;
    /** Retrieval context size sent as `search_context_size` (free-form string). */
    searchContextSize: string;
    /** 请求超时预算(ms)。默认 120s;`<= 0` 表示不设(沿用上游 signal)。 */
    requestTimeoutMs?: number;
}
/**
 * Map an OpenAI Responses response to a normalized search result. Structured
 * `web_search_call.search_results[]` entries become sources first (deduped by
 * URL); the message `url_citation` annotations — on the item or inside its text
 * blocks — then contribute the URLs some gateways expose only there. A response
 * with no search call and no citations still yields its generated answer as
 * `content` with empty `sources`; only a completely empty output is treated as
 * "the search tool never ran" and errors. The web service owns the final
 * `maxResults` truncation, so `truncated` is always `false` here.
 *
 * @param response - the parsed Responses response body.
 * @returns the normalized result with the generated answer as `content`.
 * @throws {@link WebError} when neither a search call nor citations appeared.
 */
export declare function mapOpenAiResponse(response: OpenAiResponsesResponse): WebSearchResult;
/** The OpenAI-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
export declare class OpenAiSearchProvider implements WebSearchProvider {
    private readonly resolveOptions;
    readonly id = "openai";
    /**
     * @param resolveOptions - the options for the NEXT operation, snapshotted
     * once at each operation's entry so one search never mixes two sections. A
     * thunk rather than a value because the plugin's settings section can change
     * between searches, and re-registering the provider to carry a new endpoint
     * would make the seam's selection observable to the user as a flicker.
     */
    constructor(resolveOptions: () => OpenAiSearchProviderOptions);
    available(): boolean;
    search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult>;
}
