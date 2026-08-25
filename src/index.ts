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
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
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
export const WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE = settingsNamespace('web-search-openai')

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
  /** 是否用 OpenAI 搜索接管全局 web_search 工具(默认关闭);关闭时仅注册独立的 openai_web_search 工具。 */
  searchOverride?: boolean
}

export const Config: z<Config> = z.object({
  apiKey: z.string().role('secret'),
  baseURL: z.string(),
  model: z.string(),
  maxTokens: z.number().step(1).min(1),
  searchContextSize: z.string(),
  searchOverride: z.boolean().default(false).description('用 OpenAI 搜索接管全局 web_search 工具'),
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
  }
}

/** Register the OpenAI search provider, hot-swappable by the `searchOverride` toggle. */
export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  installSettingsSection(ctx, WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE, Config, config, {
    setSource: (source) => {
      current = source
    },
    // Registration form changes (seam vs standalone tool) are synced on
    // settings/updated below; provider options stay thunked per operation.
    onChange: () => {},
  })

  const provider = new OpenAiSearchProvider(() => resolveOptions(ctx, current()))
  const disposers = new Set<() => void>()
  const syncSearch = () => {
    for (const dispose of disposers) {
      try { dispose() } catch { /* 注销失败不阻断 */ }
    }
    disposers.clear()
    const override = (current().searchOverride ?? false) === true
    if (override) {
      if (ctx.web !== undefined) {
        try {
          disposers.add(ctx.web.registerSearchProvider(provider))
        } catch { /* 注册冲突等异常不阻断 */ }
      }
    } else {
      const dispose = registerOpenAiSearchTool(ctx, provider)
      if (dispose !== undefined) disposers.add(dispose)
    }
  }
  syncSearch()
  ctx.on('settings/updated', (ns: string) => {
    if (ns === WEB_SEARCH_OPENAI_SETTINGS_NAMESPACE) syncSearch()
  })
}
