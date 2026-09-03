/**
 * OpenAI 独立搜索工具(openai_web_search):始终注册,不接管全局 web_search。
 * 不占全局 web 搜索缝(ctx.web),作为独立工具直接调用 OpenAiSearchProvider,
 * 避免与其它搜索 provider(如 llm-agy)注册进同一缝造成
 * WEB_PROVIDER_AMBIGUOUS 冲突。
 * @module web-search-openai/search-tool
 */
import type { Context } from '@deepseek-ai/cordis';
import type { WebSearchProvider } from '@deepseek-ai/dsh-web';
/**
 * 注册 openai_web_search 独立工具(含系统提示 section)。
 * @returns disposer;插件运行时被注销,支持开关热切换。
 */
export declare function registerOpenAiSearchTool(ctx: Context, provider: WebSearchProvider): (() => void) | undefined;
