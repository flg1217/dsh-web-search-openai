/**
 * Web-search settings section (browser half of `@deepseek-ai/dsh-web-search-openai`):
 * a schema-free form over the `web-search-openai` settings namespace, binding the
 * scope-bound controller to the settings shell's `settings.section` slot. The API
 * key field is write-only — the Host redacts secrets from every describe response,
 * so the card only ever writes a new value and never renders the stored one.
 * @module @deepseek-ai/dsh-web-search-openai/client
 */

import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ReactNode } from 'react'
// Type-only: the settings shell's SlotMap merge (the `settings.section` entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

/** Namespace the section edits. Spelled here rather than imported: a client package must not depend on a Host package. */
export const WEB_SEARCH_OPENAI_NS = 'web-search-openai'

/** The namespace section as the settings page edits it. */
export interface SearchSettingsValue {
  apiKey?: string
  baseURL?: string
  model?: string
  maxTokens?: number
  searchContextSize?: 'low' | 'medium' | 'high'
}

/** One editable field value, staged as text so the form controls stay uncontrolled-input friendly. */
export interface SearchSettingsDraft {
  baseURL: string
  apiKey: string
  model: string
  maxTokens: string
  searchContextSize: 'low' | 'medium' | 'high'
}

/** What the section renders. */
export interface SearchSettingsSnapshot {
  /** Whether the namespace is served to this client. */
  available: boolean
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** Whether a save is in flight. */
  saving: boolean
  /** Whether the draft differs from the served section. */
  dirty: boolean
  /** Human-readable failure of the last save; undefined when none. */
  failed: string | undefined
  /** Unix ms of the last successful save. */
  savedAt: number | undefined
  /** The current form draft. */
  draft: SearchSettingsDraft
}

/** Registration-side face the section's slot entry injects. */
export interface SearchSettingsFace {
  hooks: {
    /** Snapshot bound by the renderer as useSearchSettings. */
    searchSettings: SnapshotStore<SearchSettingsSnapshot>
  }
  /** Stage one field edit into the draft. */
  edit: (field: keyof SearchSettingsDraft, text: string) => void
  /** Write every staged field, then re-seed from what the Host accepted. */
  save: () => void
  /** Discard the draft and re-read the authoritative section. */
  reload: () => void
  /** Clear the stored API key (the field itself is write-only). */
  clearKey: () => void
}

/** Props the renderer binds for the section. */
export type SearchSettingsSectionProps =
  PropsRuntime<'settings.section'>
  & InjectFace<SearchSettingsFace>

/** Render the web-search provider settings form. */
export function SearchSettingsSection({ useSearchSettings, edit, save, reload, clearKey }: SearchSettingsSectionProps) {
  const state = useSearchSettings(value => value)
  const disabled = !state.writable || state.saving
  const row = (label: string, control: ReactNode, hint?: string) => (
    <div style={{ display: 'grid', gap: 4, alignContent: 'start' }}>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{label}</span>
        {control}
      </label>
      {hint !== undefined ? <span style={{ fontSize: 11, color: 'var(--dsw-alias-fg-muted, #77736d)' }}>{hint}</span> : null}
    </div>
  )
  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 900, padding: '8px 2px 32px' }}>
      <header>
        <h2>Web 搜索</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--dsw-alias-fg-muted, #77736d)', fontSize: 13 }}>
          OpenAI Responses API 搜索提供方（web_search 工具）。API Key 只写不回显。
        </p>
      </header>
      {state.failed !== undefined
        ? <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, background: 'rgba(205,72,72,.1)', color: '#aa3939' }}>{state.failed}</div>
        : null}
      {state.savedAt !== undefined && state.failed === undefined
        ? <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, background: 'rgba(48,154,100,.1)', color: '#267d52' }}>已保存并生效。</div>
        : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {row('服务地址', <Input value={state.draft.baseURL} disabled={disabled} onChange={(event) => { edit('baseURL', event.target.value) }} />, 'OpenAI 兼容端点；默认 https://api.openai.com/v1')}
        {row('模型', <Input value={state.draft.model} disabled={disabled} onChange={(event) => { edit('model', event.target.value) }} />)}
        {row('API Key（可选）', <Input type="password" value={state.draft.apiKey} disabled={disabled} onChange={(event) => { edit('apiKey', event.target.value) }} />, '留空保存不会改动已存密钥；清除请用下方按钮')}
        {row('最大输出 tokens', <Input inputMode="numeric" value={state.draft.maxTokens} disabled={disabled} onChange={(event) => { edit('maxTokens', event.target.value) }} />)}
        {row('检索上下文', (
          <select value={state.draft.searchContextSize} disabled={disabled} onChange={(event) => { edit('searchContextSize', event.target.value) }}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="outline" disabled={disabled || !state.dirty} onClick={save}>{state.saving ? '保存中…' : '保存并应用'}</Button>
        <Button variant="outline" disabled={disabled} onClick={reload}>重新加载</Button>
        <Button variant="outline" disabled={disabled} onClick={clearKey}>清除 API Key</Button>
      </div>
    </div>
  )
}

/** Seed the draft from the served section, falling back to the provider defaults. */
function draftOf(value: SearchSettingsValue | undefined): SearchSettingsDraft {
  return {
    baseURL: value?.baseURL ?? 'https://api.openai.com/v1',
    apiKey: '',
    model: value?.model ?? 'gpt-5.6-luna',
    maxTokens: String(value?.maxTokens ?? 2048),
    searchContextSize: value?.searchContextSize ?? 'medium',
  }
}

/** True when the draft differs from the served section on any non-secret field. */
function dirtyOf(draft: SearchSettingsDraft, value: SearchSettingsValue | undefined): boolean {
  return draft.baseURL.trim() !== (value?.baseURL ?? 'https://api.openai.com/v1')
    || draft.model.trim() !== (value?.model ?? 'gpt-5.6-luna')
    || draft.maxTokens.trim() !== String(value?.maxTokens ?? 2048)
    || draft.searchContextSize !== (value?.searchContextSize ?? 'medium')
    || draft.apiKey.trim().length > 0
}

/** Bridge the `web-search-openai` settings scope onto the section's form. */
export class SearchSettingsController {
  private draft: SearchSettingsDraft
  private saving = false
  private failed: string | undefined
  private savedAt: number | undefined
  private readonly store: SnapshotStore<SearchSettingsSnapshot>

  /**
   * @param scope - the bound settings scope for the `web-search-openai` namespace.
   */
  constructor(private readonly scope: SettingsScope<SearchSettingsValue>) {
    this.draft = draftOf(this.scope.getSnapshot().value)
    this.store = createSnapshotStore(this.project())
    this.scope.subscribe(() => {
      if (!this.saving) this.draft = draftOf(this.scope.getSnapshot().value)
      this.publish()
    })
  }

  /** Build the face the section's slot registration injects. */
  inject(): SearchSettingsFace {
    return {
      hooks: { searchSettings: this.store },
      edit: (field, text) => {
        this.draft = { ...this.draft, [field]: field === 'searchContextSize' ? text as SearchSettingsDraft['searchContextSize'] : text }
        this.publish()
      },
      save: () => { void this.save() },
      reload: () => {
        this.draft = draftOf(this.scope.getSnapshot().value)
        this.failed = undefined
        this.publish()
      },
      clearKey: () => { void this.clearKey() },
    }
  }

  /**
   * Write every staged edit, then re-seed from what the Host accepted. The API
   * key is write-only: a blank field never clears it (that is {@link clearKey}'s
   * job), and a non-blank field always writes. An invalid numeric field aborts
   * the whole save and keeps the draft.
   */
  private async save(): Promise<void> {
    const snapshot = this.scope.getSnapshot()
    if (!snapshot.writable || this.saving) return
    this.saving = true
    this.failed = undefined
    this.publish()
    try {
      const value = snapshot.value
      const writes: Array<Promise<void>> = []
      const baseURL = this.draft.baseURL.trim()
      if (baseURL !== (value?.baseURL ?? 'https://api.openai.com/v1')) {
        writes.push(baseURL.length > 0 ? this.scope.set('baseURL', baseURL) : this.scope.unset('baseURL'))
      }
      const apiKey = this.draft.apiKey.trim()
      if (apiKey.length > 0) writes.push(this.scope.set('apiKey', apiKey))
      const model = this.draft.model.trim()
      if (model !== (value?.model ?? 'gpt-5.6-luna')) {
        writes.push(model.length > 0 ? this.scope.set('model', model) : this.scope.unset('model'))
      }
      const maxTokensRaw = this.draft.maxTokens.trim()
      if (maxTokensRaw.length === 0) {
        if (value?.maxTokens !== undefined) writes.push(this.scope.unset('maxTokens'))
      } else {
        const maxTokens = Number(maxTokensRaw)
        if (!Number.isSafeInteger(maxTokens) || maxTokens <= 0) throw new Error('最大输出 tokens 必须是正整数')
        if (maxTokens !== (value?.maxTokens ?? 2048)) writes.push(this.scope.set('maxTokens', maxTokens))
      }
      if (this.draft.searchContextSize !== (value?.searchContextSize ?? 'medium')) {
        writes.push(this.scope.set('searchContextSize', this.draft.searchContextSize))
      }
      await Promise.all(writes)
      this.savedAt = Date.now()
    } catch (error) {
      this.failed = error instanceof Error ? error.message : String(error)
    } finally {
      this.saving = false
      // On success the draft re-seeds from what the Host accepted; on failure
      // it stays so the user can correct the rejected fields.
      if (this.failed === undefined) this.draft = draftOf(this.scope.getSnapshot().value)
      this.publish()
    }
  }

  /** Clear the stored API key through the scope, then re-seed. */
  private async clearKey(): Promise<void> {
    const snapshot = this.scope.getSnapshot()
    if (!snapshot.writable || this.saving) return
    try {
      await this.scope.unset('apiKey')
      this.savedAt = Date.now()
    } catch (error) {
      this.failed = error instanceof Error ? error.message : String(error)
    }
    this.draft = draftOf(this.scope.getSnapshot().value)
    this.publish()
  }

  private project(): SearchSettingsSnapshot {
    const snapshot = this.scope.getSnapshot()
    return {
      available: snapshot.status === 'ready',
      writable: snapshot.writable,
      saving: this.saving,
      dirty: dirtyOf(this.draft, snapshot.value),
      failed: this.failed,
      savedAt: this.savedAt,
      draft: this.draft,
    }
  }

  private publish(): void {
    this.store.set(this.project())
  }
}

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-openai-client'

/** Services required by the browser half. */
export const inject = ['slots', 'settingsScope']

/**
 * Mount the Web-search settings section into the settings shell.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const controller = new SearchSettingsController(ctx.settingsScope.bind({ namespace: WEB_SEARCH_OPENAI_NS }))
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'web-search-openai',
    order: 40,
    label: () => 'Web 搜索',
    inject: () => controller.inject(),
  }, SearchSettingsSection))
}
