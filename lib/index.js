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
    apiKey: z.string().role('secret').volatile(),
    baseURL: z.string().volatile(),
    model: z.string().volatile(),
    maxTokens: z.number().step(1).min(1).volatile(),
    searchContextSize: z.string().volatile(),
    requestTimeoutMs: z.number().step(1).min(0).volatile(),
});
/**
 * Project one resolved section into the options the provider serves its next
 * search with. Environment fallbacks stay here rather than in the provider:
 * every value it reads is already fully defaulted.
 * @param ctx - plugin context supplying the environment plane.
 * @param config - the currently authoritative section (live references).
 * @returns options for one search.
 */
function resolveOptions(ctx, config) {
    return {
        apiKey: config.apiKey.get() ?? launchEnvironmentOf(ctx).get('OPENAI_API_KEY')?.value ?? '',
        baseURL: config.baseURL.get() ?? OPENAI_DEFAULT_BASE_URL,
        model: config.model.get() ?? OPENAI_DEFAULT_MODEL,
        maxTokens: config.maxTokens.get() ?? OPENAI_DEFAULT_MAX_TOKENS,
        searchContextSize: config.searchContextSize.get() ?? OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE,
        requestTimeoutMs: config.requestTimeoutMs.get(),
    };
}
/** 注册 OpenAI 搜索 provider:仅提供独立的 openai_web_search 工具,不接管全局 web_search。 */
export function apply(ctx, config) {
    // 设置面板:本插件自带页面(客户端 plugins.item,「插件列表」条目详情),关掉按 schema
    // 自动生成表单的策略(0.2.1 起替代旧 installSection;策略不移除配置读写)。
    ctx.inject(['settings'], (child) => {
        child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
    });
    const provider = new OpenAiSearchProvider(() => resolveOptions(ctx, config));
    try {
        registerOpenAiSearchTool(ctx, provider);
    }
    catch { /* 已存在同名工具等异常不阻断 */ }
}
