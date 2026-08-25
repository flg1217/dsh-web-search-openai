/**
 * Wire types for the OpenAI Responses API search call (`POST /v1/responses` with the
 * `web_search` server tool). Types only — no runtime code. OpenAI runs the
 * retrieval server-side and returns output items: `message` items carry the generated
 * answer text (plus optional `url_citation` annotations), and `web_search_call` items
 * carry the structured `search_results[]` the provider maps to citeable sources.
 *
 * @module @deepseek-ai/dsh-web-search-openai/types
 */

/** The web-search tool declaration sent in the Responses request. */
export interface WebSearchTool {
  readonly type: 'web_search'
  /** Retrieval context size; free-form string (OpenAI accepts `low`/`medium`/`high`). */
  readonly search_context_size: string
}

/** Request body sent to the Responses endpoint. */
export interface OpenAiResponsesRequest {
  readonly model: string
  /** The user query verbatim, as the sole input message. */
  readonly input: string
  readonly tools: readonly WebSearchTool[]
  /** Upper bound on generated output tokens. */
  readonly max_output_tokens: number
}

/** One item of the response `output[]`, discriminated on `type`. */
export type OpenAiOutputItem = OpenAiMessageItem | OpenAiWebSearchCallItem

/** The model's generated answer message. */
export interface OpenAiMessageItem {
  readonly type: 'message'
  readonly role: string
  readonly content?: readonly OpenAiTextContentBlock[]
  readonly annotations?: readonly OpenAiUrlCitationAnnotation[]
}

/** Text block inside a message item's `content[]`. */
export interface OpenAiTextContentBlock {
  readonly type: 'output_text'
  readonly text: string
  /** URL citation annotations attached to this block; some gateways nest them here instead of on the message item. */
  readonly annotations?: readonly OpenAiUrlCitationAnnotation[]
}

/** A server-side web search execution with its structured results. */
export interface OpenAiWebSearchCallItem {
  readonly type: 'web_search_call'
  readonly id: string
  readonly status: string
  readonly search_results?: readonly OpenAiWebSearchResultItem[]
}

/** One structured search result inside a `web_search_call`. */
export interface OpenAiWebSearchResultItem {
  readonly type: 'web_search_result'
  readonly url: string
  readonly title?: string | null
  readonly description?: string | null
}

/** URL citation annotation attached to message text. */
export interface OpenAiUrlCitationAnnotation {
  readonly type: 'url_citation'
  readonly url: string
  readonly title?: string | null
}

/** The Responses API response envelope. */
export interface OpenAiResponsesResponse {
  readonly id?: string
  readonly output?: readonly OpenAiOutputItem[]
  /** Convenience concatenation of all `output_text` blocks. */
  readonly output_text?: string
}

/** OpenAI error response envelope (best-effort; field shape varies by gateway). */
export interface OpenAiErrorResponse {
  readonly error?: { readonly message?: string; readonly type?: string; readonly code?: string }
  readonly message?: string
}
