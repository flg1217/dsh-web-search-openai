import type { ClientContext, SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

export declare const WEB_SEARCH_OPENAI_NS: 'web-search-openai'

export interface SearchSettingsValue {
  apiKey?: string
  baseURL?: string
  model?: string
  maxTokens?: number
  searchContextSize?: string
  searchOverride?: boolean
}

export interface SearchSettingsDraft {
  baseURL: string
  apiKey: string
  model: string
  maxTokens: string
  searchContextSize: string
  searchOverride: boolean
}

export interface SearchSettingsSnapshot {
  available: boolean
  writable: boolean
  saving: boolean
  dirty: boolean
  failed: string | undefined
  savedAt: number | undefined
  draft: SearchSettingsDraft
}

export interface SearchSettingsFace {
  hooks: {
    searchSettings: SnapshotStore<SearchSettingsSnapshot>
  }
  edit: (field: keyof SearchSettingsDraft, text: string) => void
  toggleOverride: (next: boolean) => void
  save: () => void
  reload: () => void
  clearKey: () => void
}

export type SearchSettingsSectionProps = PropsRuntime<'settings.plugin.item'> & InjectFace<SearchSettingsFace>

export declare function SearchSettingsSection(props: SearchSettingsSectionProps): import('react').ReactNode

export declare class SearchSettingsController {
  constructor(scope: SettingsScope<SearchSettingsValue>)
  inject(): SearchSettingsFace
}

export declare const name: 'web-search-openai-client'
export declare const inject: string[]
export declare function apply(ctx: ClientContext): void
