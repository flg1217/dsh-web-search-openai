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

import type { Context } from '@deepseek-ai/cordis'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-web'
import {
  OPENAI_DEFAULT_BASE_URL,
  OPENAI_DEFAULT_MAX_TOKENS,
  OPENAI_DEFAULT_MODEL,
  OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE,
  OpenAiSearchProvider,
} from './provider.js'
import type { OpenAiSearchProviderOptions } from './provider.js'
import { registerOpenAiSearchTool } from './search-tool.js'

export {
  OPENAI_DEFAULT_BASE_URL,
  OPENAI_DEFAULT_MAX_TOKENS,
  OPENAI_DEFAULT_MODEL,
  OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE,
  OPENAI_PROVIDER_ID,
  OpenAiSearchProvider,
} from './provider.js'
export type { OpenAiSearchProviderOptions } from './provider.js'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-openai'

/** The web seam this provider registers into. */
export const inject = ['web', 'tools', 'systemPrompt']

/** Settings namespace carrying this provider's endpoint, model, and key reference. */
export const WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE = 'web-search-openai'

/** Plugin config (all optional — `apply` fills env-var and constant defaults). */
export interface Config {
  /** OpenAI API key. Falls back to `$OPENAI_API_KEY`. Empty → provider unavailable. */
  apiKey?: string
  /** Endpoint base; `/responses` is appended. Defaults to the public API. */
  baseURL?: string
  /** Responses API model name. Defaults to `gpt-5.6-luna`. */
  model?: string
  /** Upper bound on generated output tokens. Defaults to 2048. */
  maxTokens?: number
  /** Retrieval context size sent as `search_context_size` (free-form string). */
  searchContextSize?: string
  /** 请求超时预算(ms),默认 120s。 */
  requestTimeoutMs?: number
}

export const Config: z<Config> = z.object({
  apiKey: z.string().role('secret'),
  baseURL: z.string(),
  model: z.string(),
  maxTokens: z.number().step(1).min(1),
  searchContextSize: z.string(),
  requestTimeoutMs: z.number().step(1).min(0),
})

/**
 * Project one resolved section into the options the provider serves its next
 * search with. Environment fallbacks stay here rather than in the provider:
 * every value it reads is already fully defaulted.
 * @param ctx - plugin context supplying the environment plane.
 * @param config - the currently authoritative section.
 * @returns options for one search.
 */
function resolveOptions(ctx: Context, config: Config): OpenAiSearchProviderOptions {
  return {
    apiKey: config.apiKey ?? launchEnvironmentOf(ctx).get('OPENAI_API_KEY')?.value ?? '',
    baseURL: config.baseURL ?? OPENAI_DEFAULT_BASE_URL,
    model: config.model ?? OPENAI_DEFAULT_MODEL,
    maxTokens: config.maxTokens ?? OPENAI_DEFAULT_MAX_TOKENS,
    searchContextSize: config.searchContextSize ?? OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE,
    requestTimeoutMs: config.requestTimeoutMs,
  }
}

/** 注册 OpenAI 搜索 provider:仅提供独立的 openai_web_search 工具,不接管全局 web_search。 */
export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  // 官方 0.1.2:设置区经 ctx.settings.installSection 注册。
  ctx.inject(['settings'], (settingsCtx) => {
    const settings = settingsCtx.get('settings') as {
      installSection?: (
        owner: Context,
        ns: string,
        schema: unknown,
        entry: unknown,
        hooks: { setSource?: (source: () => Config | undefined) => void; onChange?: () => void },
      ) => void
    } | undefined
    settings?.installSection?.(ctx, WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE, Config, config, {
      setSource: (source) => {
        current = (() => source() ?? config) as () => Config
      },
      onChange: () => {},
    })
  })

  const provider = new OpenAiSearchProvider(() => resolveOptions(ctx, current()))
  try {
    registerOpenAiSearchTool(ctx, provider)
  } catch { /* 已存在同名工具等异常不阻断 */ }
}
