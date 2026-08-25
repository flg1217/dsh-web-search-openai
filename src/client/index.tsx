/**
 * OpenAI 搜索设置卡片(browser half of `@deepseek-ai/dsh-web-search-openai`):
 * a schema-free form over the `web-search-openai` settings namespace, bound to
 * the plugins tab's `settings.plugin.item` slot (same hierarchy as the
 * AntiGravity / CodeBuddy cards). The API key field is write-only — the Host
 * redacts secrets from every describe response, so the card only ever writes a
 * new value and never renders the stored one.
 * @module @deepseek-ai/dsh-web-search-openai/client
 */

import { Button, IconChevronDownOutline14, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

/** Namespace the card edits. Spelled here rather than imported: a client package must not depend on a Host package. */
export const WEB_SEARCH_OPENAI_NS = 'web-search-openai'

/** The namespace section as the card edits it. */
export interface SearchSettingsValue {
  apiKey?: string
  baseURL?: string
  model?: string
  maxTokens?: number
  /** search_context_size:检索时喂给模型的网页上下文量,自由字符串。 */
  searchContextSize?: string
  /** 是否接管全局 web_search 工具(开)或仅提供独立 openai_web_search 工具(关)。 */
  searchOverride?: boolean
}

/** One editable field value, staged as text so the form controls stay uncontrolled-input friendly. */
export interface SearchSettingsDraft {
  baseURL: string
  apiKey: string
  model: string
  maxTokens: string
  searchContextSize: string
  searchOverride: boolean
}

/** What the card renders. */
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

/** Registration-side face the card's slot entry injects. */
export interface SearchSettingsFace {
  hooks: {
    /** Snapshot bound by the renderer as useSearchSettings. */
    searchSettings: SnapshotStore<SearchSettingsSnapshot>
  }
  /** Stage one field edit into the draft. */
  edit: (field: keyof SearchSettingsDraft, text: string) => void
  /** Toggle the searchOverride checkbox in the draft. */
  toggleOverride: (next: boolean) => void
  /** Write every staged field, then re-seed from what the Host accepted. */
  save: () => void
  /** Discard the draft and re-read the authoritative section. */
  reload: () => void
  /** Clear the stored API key (the field itself is write-only). */
  clearKey: () => void
}

/** Props the renderer binds for the card. */
export type SearchSettingsSectionProps =
  PropsRuntime<'settings.plugin.item'>
  & InjectFace<SearchSettingsFace>

/** 卡片 CSS(与 AntiGravity/CodeBuddy 卡片完全同款)。 */
const CSS: Record<string, string> = {
  card: '.dshOpenai_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}',
  cardHover: '.dshOpenai_card:hover{border-color:var(--dsw-alias-label-dimmed)}',
  cardOpen: '.dshOpenai_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}',
  header: '.dshOpenai_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}',
  headerFocus: '.dshOpenai_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}',
  headText: '.dshOpenai_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}',
  name: '.dshOpenai_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}',
  description: '.dshOpenai_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}',
  chevron: '.dshOpenai_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}',
  chevronOpen: '.dshOpenai_chevronOpen{transform:rotate(180deg)}',
  body: '.dshOpenai_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}',
  field: '.dshOpenai_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}',
  fieldTop: '.dshOpenai_field+.dshOpenai_field{border-top:1px solid var(--dsw-alias-border-l2)}',
  fieldHead: '.dshOpenai_fieldHead{align-items:center;gap:8px;display:flex}',
  label: '.dshOpenai_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}',
  hint: '.dshOpenai_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}',
  input: '.dshOpenai_input{display:flex;width:100%;min-width:0;box-sizing:border-box}.dshOpenai_input input{flex:1;min-width:0;width:100%;box-sizing:border-box}',
  row: '.dshOpenai_row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0}',
}

const cssText = Object.values(CSS).join('')
const tagId = '@dsh-external/web-search-openai/card.css'
if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) === null) {
  const tag = document.createElement('style')
  tag.dataset.plugin = '@dsh-external/web-search-openai'
  tag.dataset.pluginCss = tagId
  tag.textContent = cssText
  document.head.appendChild(tag)
}
const C = {
  card: 'dshOpenai_card', cardOpen: 'dshOpenai_cardOpen', header: 'dshOpenai_header',
  headText: 'dshOpenai_headText', name: 'dshOpenai_name', description: 'dshOpenai_description',
  chevron: 'dshOpenai_chevron', chevronOpen: 'dshOpenai_chevronOpen', body: 'dshOpenai_body',
  field: 'dshOpenai_field', fieldHead: 'dshOpenai_fieldHead', label: 'dshOpenai_label',
  hint: 'dshOpenai_hint', input: 'dshOpenai_input', row: 'dshOpenai_row',
}

/** Render the OpenAI search provider settings card (plugins tab). */
export function SearchSettingsSection({ useSearchSettings, edit, toggleOverride, save, reload, clearKey }: SearchSettingsSectionProps) {
  const state = useSearchSettings(value => value)
  const [open, setOpen] = useState(false)
  const disabled = !state.writable || state.saving
  const field = (label: string, control: ReactNode, hint?: string) => (
    <div className={C.field}>
      <div className={C.fieldHead}>
        <span className={C.label}>{label}</span>
      </div>
      {control}
      {hint !== undefined ? <p className={C.hint}>{hint}</p> : null}
    </div>
  )
  return (
    <li className={`${C.card} ${open ? C.cardOpen : ''}`}>
      <button type="button" className={C.header} aria-expanded={open}
        aria-label={`${open ? '收起' : '展开'}: OpenAI 搜索`}
        onClick={() => setOpen(!open)}>
        <span className={C.headText}>
          <span className={C.name}>OpenAI 搜索</span>
          <span className={C.description}>OpenAI Responses API 搜索提供方(web_search 工具)</span>
        </span>
        <IconChevronDownOutline14 className={`${C.chevron} ${open ? C.chevronOpen : ''}`} />
      </button>
      {open && (
        <div className={C.body}>
          {state.failed !== undefined
            ? <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, background: 'rgba(205,72,72,.1)', color: '#aa3939' }}>{state.failed}</div>
            : null}
          {state.savedAt !== undefined && state.failed === undefined
            ? <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, background: 'rgba(48,154,100,.1)', color: '#267d52' }}>已保存并生效。</div>
            : null}
          {field('服务地址',
            <Input className={C.input} value={state.draft.baseURL} disabled={disabled} onChange={(event) => { edit('baseURL', event.target.value) }} />,
            'OpenAI 兼容端点；默认 https://api.openai.com/v1')}
          {field('模型',
            <Input className={C.input} value={state.draft.model} disabled={disabled} onChange={(event) => { edit('model', event.target.value) }} />)}
          {field('API Key(可选)',
            <Input className={C.input} type="password" value={state.draft.apiKey} disabled={disabled} onChange={(event) => { edit('apiKey', event.target.value) }} />,
            '留空保存不会改动已存密钥;清除请用下方按钮')}
          {field('最大输出 tokens',
            <Input className={C.input} inputMode="numeric" value={state.draft.maxTokens} disabled={disabled} onChange={(event) => { edit('maxTokens', event.target.value) }} />)}
          {field('search_context_size',
            <Input className={C.input} value={state.draft.searchContextSize} disabled={disabled} onChange={(event) => { edit('searchContextSize', event.target.value) }} />,
            '检索时喂给模型的网页上下文量(官方值 low/medium/high,可自定义)')}
          <div className={C.field}>
            <div className={C.fieldHead}>
              <span className={C.label}>接管全局 web_search</span>
              <input type="checkbox" checked={state.draft.searchOverride} disabled={disabled}
                onChange={(event) => { toggleOverride(event.target.checked) }}
                style={{ accentColor: 'var(--dsw-alias-brand-primary)', width: 16, height: 16, cursor: 'pointer' }} />
            </div>
            <p className={C.hint}>
              {state.draft.searchOverride
                ? '开启:全局 web_search 工具由 OpenAI 搜索提供(需与部署配置 web.searchProvider 一致,并关闭其它插件的搜索接管)'
                : '关闭:不占全局搜索,仅提供独立的 openai_web_search 工具'}
            </p>
          </div>
          <div className={C.row}>
            <Button variant="outline" disabled={disabled || !state.dirty} onClick={save}>{state.saving ? '保存中…' : '保存并应用'}</Button>
            <Button variant="outline" disabled={disabled} onClick={reload}>重新加载</Button>
            <Button variant="outline" disabled={disabled} onClick={clearKey}>清除 API Key</Button>
          </div>
        </div>
      )}
    </li>
  )
}

/** Seed the draft from the served section, falling back to the provider defaults. */
function draftOf(value: SearchSettingsValue | undefined): SearchSettingsDraft {
  return {
    baseURL: value?.baseURL ?? 'https://api.openai.com/v1',
    apiKey: '',
    model: value?.model ?? 'gpt-5.6-luna',
    maxTokens: String(value?.maxTokens ?? 128000),
    searchContextSize: value?.searchContextSize ?? 'medium',
    searchOverride: value?.searchOverride ?? false,
  }
}

/** True when the draft differs from the served section on any non-secret field. */
function dirtyOf(draft: SearchSettingsDraft, value: SearchSettingsValue | undefined): boolean {
  return draft.baseURL.trim() !== (value?.baseURL ?? 'https://api.openai.com/v1')
    || draft.model.trim() !== (value?.model ?? 'gpt-5.6-luna')
    || draft.maxTokens.trim() !== String(value?.maxTokens ?? 128000)
    || draft.searchContextSize !== (value?.searchContextSize ?? 'medium')
    || draft.searchOverride !== (value?.searchOverride ?? false)
    || draft.apiKey.trim().length > 0
}

/** Bridge the `web-search-openai` settings scope onto the card's form. */
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

  /** Build the face the card's slot registration injects. */
  inject(): SearchSettingsFace {
    return {
      hooks: { searchSettings: this.store },
      edit: (field, text) => {
        this.draft = { ...this.draft, [field]: text }
        this.publish()
      },
      toggleOverride: (next) => {
        this.draft = { ...this.draft, searchOverride: next }
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
        if (maxTokens !== (value?.maxTokens ?? 128000)) writes.push(this.scope.set('maxTokens', maxTokens))
      }
      if (this.draft.searchContextSize !== (value?.searchContextSize ?? 'medium')) {
        writes.push(this.scope.set('searchContextSize', this.draft.searchContextSize))
      }
      if (this.draft.searchOverride !== (value?.searchOverride ?? false)) {
        writes.push(this.draft.searchOverride ? this.scope.set('searchOverride', true) : this.scope.unset('searchOverride'))
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
 * Mount the OpenAI search card into the plugins tab (`settings.plugin.item`,
 * keyed by the namespace — same hierarchy as the AntiGravity/CodeBuddy cards).
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const controller = new SearchSettingsController(ctx.settingsScope.bind({ namespace: WEB_SEARCH_OPENAI_NS }))
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    // id(rc.6 list 槽)与 key(rc.7 keyed 槽)都传,兼容两种槽类型。
    id: WEB_SEARCH_OPENAI_NS,
    key: WEB_SEARCH_OPENAI_NS,
    order: 40,
    label: () => 'OpenAI 搜索',
    inject: () => controller.inject(),
  }, SearchSettingsSection))
}
