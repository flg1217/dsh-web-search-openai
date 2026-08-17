#!/usr/bin/env node
/**
 * Build @dsh-external/dsh-web-search-openai:
 *   1. tsc 编译服务端 src/*.ts → lib/*.js + lib/types/*.d.ts (ESM, bundler resolution)
 *   2. esbuild 打包浏览器端 src/client/index.tsx → lib/client.js
 *      (window.__ModuleLoader__.load 封装; `react`/`react/jsx-runtime`/`@deepseek-ai/*`
 *       保持 external,由 dsh client-modules 运行时按 factory(require) 解析)
 * 无 tsdown/react 构建依赖,Node 侧仅需 typescript + esbuild。
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = dirname(fileURLToPath(import.meta.url))
const pkg = join(root, '..')
const outDir = join(pkg, 'lib')
const srcDir = join(pkg, 'src')
const ID = '@dsh-external/dsh-web-search-openai'

/** Hand-written type stub for the browser half (the real types live in src/client/index.tsx). */
const CLIENT_TYPES = `import type { ClientContext, SettingsScope, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

export declare const WEB_SEARCH_OPENAI_NS: 'web-search-openai'

export interface SearchSettingsValue {
  apiKey?: string
  baseURL?: string
  model?: string
  maxTokens?: number
  searchContextSize?: 'low' | 'medium' | 'high'
}

export interface SearchSettingsDraft {
  baseURL: string
  apiKey: string
  model: string
  maxTokens: string
  searchContextSize: 'low' | 'medium' | 'high'
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
  save: () => void
  reload: () => void
  clearKey: () => void
}

export type SearchSettingsSectionProps = PropsRuntime<'settings.section'> & InjectFace<SearchSettingsFace>

export declare function SearchSettingsSection(props: SearchSettingsSectionProps): import('react').ReactNode

export declare class SearchSettingsController {
  constructor(scope: SettingsScope<SearchSettingsValue>)
  inject(): SearchSettingsFace
}

export declare const name: 'web-search-openai-client'
export declare const inject: string[]
export declare function apply(ctx: ClientContext): void
`


console.log('build: cleaning lib/')
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

console.log('build: tsc server half (src/*.ts → lib/)')
execFileSync('npx', ['tsc', '-p', join(pkg, 'tsconfig.json')], { stdio: 'inherit', shell: true })

console.log('build: esbuild client bundle (src/client/index.tsx → lib/client.js)')
const result = await build({
  entryPoints: [join(srcDir, 'client', 'index.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  external: ['react', 'react/jsx-runtime', 'react-dom', '@deepseek-ai/*'],
  minify: false,
  legalComments: 'none',
})
const inner = result.outputFiles[0].text.replace(/\n$/, '')
const bundled = [
  `window.__ModuleLoader__.load({`,
  `  id: ${JSON.stringify(ID)},`,
  `  factory: (require) => {`,
  `    var module = { exports: {} };`,
  `    var exports = module.exports;`,
  indent(inner, 4),
  `  }`,
  `});`,
  ``,
].join('\n')
writeFileSync(join(outDir, 'client.js'), bundled)

console.log('build: write client type stub (lib/types/client/index.d.ts)')
mkdirSync(join(outDir, 'types', 'client'), { recursive: true })
writeFileSync(join(outDir, 'types', 'client', 'index.d.ts'), CLIENT_TYPES)

console.log('build: done')

/** Indent every line of `text` by `spaces`. */
function indent(text, spaces) {
  const pad = ' '.repeat(spaces)
  return text.split('\n').map((line) => line.length === 0 ? line : pad + line).join('\n')
}
