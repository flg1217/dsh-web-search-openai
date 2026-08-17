/**
 * Wire types for the OpenAI Responses API search call (`POST /v1/responses` with the
 * `web_search` server tool). Types only — no runtime code. OpenAI runs the
 * retrieval server-side and returns output items: `message` items carry the generated
 * answer text (plus optional `url_citation` annotations), and `web_search_call` items
 * carry the structured `search_results[]` the provider maps to citeable sources.
 *
 * @module @deepseek-ai/dsh-web-search-openai/types
 */
export {};
