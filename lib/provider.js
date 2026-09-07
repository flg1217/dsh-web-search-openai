/**
 * OpenAI search through the Responses API with the native `web_search` server
 * tool. Each search runs a server-side retrieval that also generates an
 * answer; the structured `web_search_call` results (or, failing those, the
 * message `url_citation` annotations) become the citeable sources and the
 * generated answer becomes `content`. The wire format and native `fetch` client
 * are provider-private and do not use `ctx.llm`.
 * @module @dsh-external/dsh-web-search-openai/provider
 */
import { WebError } from '@deepseek-ai/dsh-web';
/** Stable id this provider registers under. */
export const OPENAI_PROVIDER_ID = 'openai';
/** Default endpoint: the public OpenAI Responses API, `/v1` included (`/responses` is appended). */
export const OPENAI_DEFAULT_BASE_URL = 'https://api.openai.com/v1';
/** Default model name. Deployment-specific; a Codex reverse proxy names its own model. */
export const OPENAI_DEFAULT_MODEL = 'gpt-5.6-luna';
/** Default upper bound on generated output tokens for the Responses request. */
export const OPENAI_DEFAULT_MAX_TOKENS = 128000;
/** Default `web_search` retrieval context size. */
export const OPENAI_DEFAULT_SEARCH_CONTEXT_SIZE = 'medium';
/** 请求超时(ms):OpenAI API 挂起(网络黑洞)时不能无限等待。
 * 与 CLI 型执行器(AGY/CodeBuddy 的空闲超时)哲学一致:长时间无响应即判定
 * 卡死并明确报错;正常检索一般 15-90 秒,120s 窗口足够宽松。 */
export const OPENAI_DEFAULT_REQUEST_TIMEOUT_MS = 120_000;
/** Attribution header sent on every request. Bump with the package version. */
const USER_AGENT = 'deepseek-harness/0.0.1';
/**
 * Map an OpenAI Responses response to a normalized search result. Structured
 * `web_search_call.search_results[]` entries become sources first (deduped by
 * URL); the message `url_citation` annotations — on the item or inside its text
 * blocks — then contribute the URLs some gateways expose only there. A response
 * with no search call and no citations still yields its generated answer as
 * `content` with empty `sources`; only a completely empty output is treated as
 * "the search tool never ran" and errors. The web service owns the final
 * `maxResults` truncation, so `truncated` is always `false` here.
 *
 * @param response - the parsed Responses response body.
 * @returns the normalized result with the generated answer as `content`.
 * @throws {@link WebError} when neither a search call nor citations appeared.
 */
export function mapOpenAiResponse(response) {
    const output = response.output ?? [];
    const searchCalls = output.filter((item) => item.type === 'web_search_call');
    const seen = new Set();
    const sources = [];
    // Structured `search_results[]` are authoritative when the gateway exposes them.
    for (const call of searchCalls) {
        for (const item of call.search_results ?? []) {
            if (item.url.length === 0 || seen.has(item.url))
                continue;
            seen.add(item.url);
            sources.push({
                url: item.url,
                ...item.title != null && item.title.length > 0 ? { title: item.title } : {},
                ...item.description != null && item.description.trim().length > 0 ? { snippet: item.description } : {},
            });
        }
    }
    // Answer-text citations are the fallback source of URLs; some gateways expose
    // no structured results at all and cite only inside the message text.
    sources.push(...collectCitationSources(output, seen));
    // `output_text` is the convenience mirror of the answer; some gateways leave
    // it empty and carry the answer only in the message blocks, so a blank value
    // falls back to the concatenated block text.
    const content = response.output_text || messageText(output);
    // 仅有当"没有搜索调用、没有引用来源、连答案文本都没有"——即响应完全为空——
    // 才判定搜索未触发并报错。网关侧可能不执行 web_search 却仍返回模型的直接
    // 回答;这时把答案作为 content、空 sources 正常返回,而不是丢掉内容报错。
    if (searchCalls.length === 0 && sources.length === 0 && (content === undefined || content.length === 0)) {
        throw new WebError('OpenAI returned no web search results; the request may not have triggered web search', 'WEB_PROVIDER_ERROR');
    }
    return {
        ...content != null && content.length > 0 ? { content } : {},
        sources,
        truncated: false,
    };
}
/**
 * Collect the URL-only citation sources from every message item's
 * `url_citation` annotations, deduped by URL. Annotations may sit on the
 * message item itself (the canonical shape) or inside its text content blocks
 * (some gateways nest them there); both are read.
 *
 * @param output - the response's output items.
 * @param seen - the URL set to dedupe against (shared with the caller).
 * @returns the annotation-derived sources (empty when no citations exist).
 */
function collectCitationSources(output, seen) {
    const sources = [];
    for (const item of output) {
        if (item.type !== 'message')
            continue;
        for (const annotation of item.annotations ?? []) {
            const source = mapCitationSource(annotation, seen);
            if (source !== undefined)
                sources.push(source);
        }
        for (const block of item.content ?? []) {
            for (const annotation of block.annotations ?? []) {
                const source = mapCitationSource(annotation, seen);
                if (source !== undefined)
                    sources.push(source);
            }
        }
    }
    return sources;
}
/**
 * Concatenate the answer text from every message's `output_text` blocks. The
 * canonical Responses envelope mirrors it in `output_text`, but some gateways
 * leave that field empty and carry the answer only in the blocks.
 *
 * @param output - the response's output items.
 * @returns the concatenated answer text, or `undefined` when there is none.
 */
function messageText(output) {
    let text = '';
    for (const item of output) {
        if (item.type !== 'message')
            continue;
        for (const block of item.content ?? []) {
            if (block.type === 'output_text' && block.text.length > 0)
                text += block.text;
        }
    }
    return text.length > 0 ? text : undefined;
}
/** Map one URL citation to a source, or `undefined` when it is a duplicate or blank. */
function mapCitationSource(annotation, seen) {
    if (annotation.url.length === 0 || seen.has(annotation.url)) {
        return undefined;
    }
    seen.add(annotation.url);
    return {
        url: annotation.url,
        ...annotation.title != null && annotation.title.length > 0 ? { title: annotation.title } : {},
    };
}
/** The OpenAI-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
export class OpenAiSearchProvider {
    resolveOptions;
    id = OPENAI_PROVIDER_ID;
    /**
     * @param resolveOptions - the options for the NEXT operation, snapshotted
     * once at each operation's entry so one search never mixes two sections. A
     * thunk rather than a value because the plugin's settings section can change
     * between searches, and re-registering the provider to carry a new endpoint
     * would make the seam's selection observable to the user as a flicker.
     */
    constructor(resolveOptions) {
        this.resolveOptions = resolveOptions;
    }
    available() {
        const options = this.resolveOptions();
        return options.apiKey.length > 0
            && URL.canParse(options.baseURL)
            && isPositiveInteger(options.maxTokens);
    }
    async search(request, signal) {
        // One snapshot for the whole operation: a settings write landing inside
        // the request must not mix a new endpoint with an old key.
        const options = this.resolveOptions();
        const endpoint = `${options.baseURL}/responses`;
        const tool = {
            type: 'web_search',
            search_context_size: options.searchContextSize,
        };
        const body = {
            model: options.model,
            input: request.query,
            tools: [tool],
            max_output_tokens: options.maxTokens,
        };
        // 请求超时:与调用方取消信号合并,任一触发即中止(避免 API 挂起时无限等)。
        const requestTimeoutMs = options.requestTimeoutMs ?? OPENAI_DEFAULT_REQUEST_TIMEOUT_MS;
        const effectiveSignal = requestTimeoutMs > 0
            ? (signal !== undefined ? AbortSignal.any([signal, AbortSignal.timeout(requestTimeoutMs)]) : AbortSignal.timeout(requestTimeoutMs))
            : signal;
        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                redirect: 'error',
                headers: {
                    'authorization': `Bearer ${options.apiKey}`,
                    'content-type': 'application/json',
                    'accept': 'application/json',
                    'user-agent': USER_AGENT,
                },
                body: JSON.stringify(body),
                ...effectiveSignal !== undefined ? { signal: effectiveSignal } : {},
            });
        }
        catch (error) {
            if (isAbortError(error))
                throw new WebError('OpenAI search aborted', 'WEB_ABORTED', { cause: error });
            if (isTimeoutError(error)) {
                throw new WebError(`OpenAI search timed out after ${Math.round(requestTimeoutMs / 1000)}s`, 'WEB_TIMEOUT', { cause: error });
            }
            throw new WebError(`OpenAI search request failed: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error });
        }
        if (!response.ok) {
            const status = response.status;
            let message = `OpenAI API error (HTTP ${status})`;
            try {
                const parsed = await response.json();
                const detail = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message ?? parsed.message;
                if (detail !== undefined && detail.length > 0)
                    message = detail;
            }
            catch (error) {
                // An abort fired mid-body must surface as WEB_ABORTED, not be swallowed
                // into a generic HTTP-error message — cancellation is not a provider
                // error (the seam's cancellation contract).
                if (isAbortError(error))
                    throw new WebError('OpenAI search aborted', 'WEB_ABORTED', { cause: error });
                // Otherwise: the HTTP status is already captured in `message` above; a
                // malformed/non-JSON error body (normal for gateway 5xx/429s) can only
                // cost a richer provider message, never the real error.
            }
            throw new WebError(message, 'WEB_PROVIDER_ERROR');
        }
        try {
            const payload = await response.json();
            return mapOpenAiResponse(payload);
        }
        catch (error) {
            if (isAbortError(error))
                throw new WebError('OpenAI search aborted', 'WEB_ABORTED', { cause: error });
            if (error instanceof WebError)
                throw error;
            throw new WebError(`OpenAI returned an unprocessable response body: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error });
        }
    }
}
/** True for a fetch/`AbortSignal` abort, surfaced as `WEB_ABORTED`. */
function isAbortError(error) {
    return error instanceof DOMException && error.name === 'AbortError';
}
/** True for the request-timeout abort (`AbortSignal.timeout`), surfaced as `WEB_TIMEOUT`. */
function isTimeoutError(error) {
    if (error instanceof DOMException && error.name === 'TimeoutError')
        return true;
    if (error instanceof Error) {
        return error.name === 'TimeoutError' || error.message.includes('aborted due to timeout');
    }
    return false;
}
/** True for OpenAI request limits that can be sent to the Responses API. */
function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}
