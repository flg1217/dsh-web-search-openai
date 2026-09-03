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
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment';
import z from '@deepseek-ai/schemastery';
import { OPENAI_DEFAULT_BASE_URL, OPENAI_DEFAULT_MAX_TOKENS, OPENAI_DEFAULT_MODEL, OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE, OpenAiSearchProvider, } from './provider.js';
import { registerOpenAiSearchTool } from './search-tool.js';
export { OPENAI_DEFAULT_BASE_URL, OPENAI_DEFAULT_MAX_TOKENS, OPENAI_DEFAULT_MODEL, OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE, OPENAI_PROVIDER_ID, OpenAiSearchProvider, } from './provider.js';
/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-openai';
/** The web seam this provider registers into. */
export const inject = ['web', 'tools', 'systemPrompt'];
/** Settings namespace carrying this provider's endpoint, model, and key reference. */
export const WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE = 'web-search-openai';
export const Config = z.object({
    apiKey: z.string().role('secret'),
    baseURL: z.string(),
    model: z.string(),
    maxTokens: z.number().step(1).min(1),
    searchContextSize: z.string(),
    requestTimeoutMs: z.number().step(1).min(0),
});
/**
 * Project one resolved section into the options the provider serves its next
 * search with. Environment fallbacks stay here rather than in the provider:
 * every value it reads is already fully defaulted.
 * @param ctx - plugin context supplying the environment plane.
 * @param config - the currently authoritative section.
 * @returns options for one search.
 */
function resolveOptions(ctx, config) {
    return {
        apiKey: config.apiKey ?? launchEnvironmentOf(ctx).get('OPENAI_API_KEY')?.value ?? '',
        baseURL: config.baseURL ?? OPENAI_DEFAULT_BASE_URL,
        model: config.model ?? OPENAI_DEFAULT_MODEL,
        maxTokens: config.maxTokens ?? OPENAI_DEFAULT_MAX_TOKENS,
        searchContextSize: config.searchContextSize ?? OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE,
        requestTimeoutMs: config.requestTimeoutMs,
    };
}
/** 注册 OpenAI 搜索 provider:仅提供独立的 openai_web_search 工具,不接管全局 web_search。 */
export function apply(ctx, config) {
    let current = () => config;
    // 官方 0.1.2:设置区经 ctx.settings.installSection 注册。
    ctx.inject(['settings'], (settingsCtx) => {
        const settings = settingsCtx.get('settings');
        settings?.installSection?.(ctx, WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE, Config, config, {
            setSource: (source) => {
                current = (() => source() ?? config);
            },
            onChange: () => { },
        });
    });
    const provider = new OpenAiSearchProvider(() => resolveOptions(ctx, current()));
    try {
        registerOpenAiSearchTool(ctx, provider);
    }
    catch { /* 已存在同名工具等异常不阻断 */ }
}
