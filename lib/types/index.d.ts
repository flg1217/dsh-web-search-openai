/**
 * `@dsh-external/dsh-web-search-openai`: registers an OpenAI Responses API-backed
 * `WebSearchProvider` with `ctx.web`. A function/namespace plugin (NOT a
 * default-export service): a search provider does not own the `ctx.web` key —
 * it registers INTO the seam's provider registry, exactly as
 * `@deepseek-ai/dsh-llm-deepseek` registers an adapter into `ctx.llm`. The key
 * is owned by `@deepseek-ai/dsh-web`.
 *
 * @module @dsh-external/dsh-web-search-openai
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { OPENAI_DEFAULT_BASE_URL, OPENAI_DEFAULT_MAX_TOKENS, OPENAI_DEFAULT_MODEL, OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE, OPENAI_PROVIDER_ID, OpenAiSearchProvider, } from './provider.js';
export type { OpenAiSearchProviderOptions } from './provider.js';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "web-search-openai";
/** The web seam this provider registers into. */
export declare const inject: string[];
/** Settings namespace carrying this provider's endpoint, model, and key reference. */
export declare const WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Plugin config (all optional — `apply` fills env-var and constant defaults). */
export interface Config {
    /** OpenAI API key. Falls back to `$OPENAI_API_KEY`. Empty → provider unavailable. */
    apiKey?: string;
    /** Endpoint base; `/responses` is appended. Defaults to the public API. */
    baseURL?: string;
    /** Responses API model name. Defaults to `gpt-5.6-luna`. */
    model?: string;
    /** Upper bound on generated output tokens. Defaults to 2048. */
    maxTokens?: number;
    /** Retrieval context size sent as `search_context_size` (free-form string). */
    searchContextSize?: string;
    /** 请求超时预算(ms),默认 120s。 */
    requestTimeoutMs?: number;
}
export declare const Config: z<Config>;
/** 注册 OpenAI 搜索 provider:仅提供独立的 openai_web_search 工具,不接管全局 web_search。 */
export declare function apply(ctx: Context, config: Config): void;
