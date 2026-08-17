# dsh-web-search-openai

> **OpenAI Responses API 网页搜索插件 — DeepSeek Harness (dsh) 的 `web_search` 提供方**
> 把 OpenAI Responses API 的原生 `web_search` 服务端检索能力接入 dsh 的网页搜索通道：搜索、出题、带来源引用。开箱即用，零源码改动。

## 一、这是什么

**dsh-web-search-openai** 是面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的开源插件，向 `ctx.web` 注册一个 **OpenAI Responses API 驱动的搜索提供方**：

| 能力 | 说明 |
| --- | --- |
| **服务端检索** | 每次搜索调用 `POST /responses`，携带原生 `web_search` 工具，由服务端完成检索并生成回答 |
| **可引用来源** | `web_search_call.search_results[]` 结构化结果（或消息级 `url_citation` 注解兜底）归一化为可引用来源 |
| **Web 设置卡片** | dsh 设置 → 搜索 → "Web 搜索" 卡片：端点、模型、API Key（只写不回显）、max tokens、检索上下文 |

插件严格遵循 dsh 官方扩展机制（profile bundle patch / `registerSearchProvider` / 客户端 slot），**不修改 dsh 任何源码**，可随 dsh 平滑升级。

## 二、安装（装配进 profile）

要求：dsh `>= 0.1.0-rc.6`。`lib/` 已随仓库提交，**无需构建**。

方式一（推荐，等价于 `dsh plugin add`）：

```bash
node scripts/link-profile.mjs            # 默认装配进 web profile
# 或指定 profile:
node scripts/link-profile.mjs --profile headless
```

方式二（手工）：

```bash
dsh plugin --profile web add <本仓库目录>
```

完成后**重启 `dsh web`**，bundle 层才会加载。

## 三、使用

1. 在 dsh Web 设置 → 搜索 → **Web 搜索** 卡片里填好端点 / 模型 / API Key（或让插件读环境变量 `OPENAI_API_KEY`）。
2. 把 web 通道的 `searchProvider` 切到 `openai`（profile 的 `cordis.patch.yml` 里 `web.searchProvider`，或设置面板切换）。

默认值：

| 项 | 默认 |
| --- | --- |
| 端点 | `https://api.openai.com/v1`（`/responses` 自动追加） |
| 模型 | `gpt-5.6-luna` |
| 最大输出 tokens | `2048` |
| 检索上下文 | `medium` |
| API Key | 插件 config `apiKey` → 环境变量 `OPENAI_API_KEY` → 不可用 |

## 四、工作原理

插件为**双面结构**，由 dsh 官方扩展机制装配：

```
┌─────────────── 宿主进程(node 半)──────────────────┐
│ src/index.ts   插件入口:settings 命名空间 + 注册提供方 │
│ src/provider.ts OpenAiSearchProvider — fetch /responses│
│                web_search 工具 + 来源/回答归一化      │
└──────────────────────────────────────────────────┘
┌─────────────── 浏览器(web 半)──────────────────────┐
│ src/client/index.tsx 设置面板 "Web 搜索" 卡片        │
│                settings.section slot,写只回显密钥     │
└──────────────────────────────────────────────────┘
```

- `dsh.bundle.patch` → `cordis.patch.yml`：把插件行插入 profile 名单（bundle 层）。
- `dsh.client.inject` → 浏览器半在 Web GUI 加载（`/plugins/web-search-openai/client.js`）。

## 五、开发

```bash
pnpm install        # 安装 typescript + esbuild
pnpm build          # 服务端 tsc → lib/；客户端 esbuild → lib/client.js(ModuleLoader 封装)
pnpm typecheck      # tsc --noEmit
```

`lib/` 必须提交（用户免构建装配）。

## 六、诊断

- 设置卡片保存失败：检查端点可达性 / API Key 有效性。
- 搜索报 `WEB_PROVIDER_ERROR`：OpenAI 网关返回非 2xx（错误详情透传）。
- 设置卡片不出现：确认 bundle 层已加载（`dsh plugin list`），重启 `dsh web`。

## 七、许可

MIT
