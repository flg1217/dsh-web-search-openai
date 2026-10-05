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
import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { OPENAI_DEFAULT_BASE_URL, OPENAI_DEFAULT_MAX_TOKENS, OPENAI_DEFAULT_MODEL, OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE, OPENAI_PROVIDER_ID, OpenAiSearchProvider, } from './provider.js';
export type { OpenAiSearchProviderOptions } from './provider.js';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "web-search-openai";
/** The web seam this provider registers into. */
export declare const inject: string[];
/** Settings namespace carrying this provider's endpoint, model, and key reference. */
export declare const WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE = "web-search-openai";
/**
 * Plugin config (profile entry id `web-search-openai`; the schema is the
 * settings form — volatile fields are live references read through `.get()`).
 * All optional — `apply` fills env-var and constant defaults at resolve time.
 */
export interface Config {
    /** OpenAI API key. Falls back to `$OPENAI_API_KEY`. Empty → provider unavailable. */
    apiKey: Volatile<string | undefined>;
    /** Endpoint base; `/responses` is appended. Defaults to the public API. */
    baseURL: Volatile<string | undefined>;
    /** Responses API model name. Defaults to `gpt-5.6-luna`. */
    model: Volatile<string | undefined>;
    /** Upper bound on generated output tokens. Defaults to 2048. */
    maxTokens: Volatile<number | undefined>;
    /** Retrieval context size sent as `search_context_size` (free-form string). */
    searchContextSize: Volatile<string | undefined>;
    /** 请求超时预算(ms),默认 120s。 */
    requestTimeoutMs: Volatile<number | undefined>;
}
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    apiKey: z<string, string, "volatile">;
    baseURL: z<string, string, "volatile">;
    model: z<string, string, "volatile">;
    maxTokens: z<number, number, "volatile">;
    searchContextSize: z<string, string, "volatile">;
    requestTimeoutMs: z<number, number, "volatile">;
}>>, Schemastery.ObjectT<NoInfer<{
    apiKey: z<string, string, "volatile">;
    baseURL: z<string, string, "volatile">;
    model: z<string, string, "volatile">;
    maxTokens: z<number, number, "volatile">;
    searchContextSize: z<string, string, "volatile">;
    requestTimeoutMs: z<number, number, "volatile">;
}>>, "plain">;
/** 注册 OpenAI 搜索 provider:仅提供独立的 openai_web_search 工具,不接管全局 web_search。 */
export declare function apply(ctx: Context, config: Config): void;
