import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { FallbackChatProvider } from './fallbackProvider.js';
import type { ChatProvider, CompletionRequest, CompletionResult } from './types.js';

interface OpenAiChatResponse {
  model?: string;
  choices?: { message?: { content?: string } }[];
}

/**
 * OpenAI-compatible chat provider. Works with OpenAI, Azure-compatible gateways
 * and any server exposing the /chat/completions shape. On any upstream or
 * parsing failure it degrades to the deterministic fallback so callers always
 * receive a usable, safe response.
 */
export class OpenAiChatProvider implements ChatProvider {
  readonly name = 'openai';
  private readonly fallback = new FallbackChatProvider();

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
  ) {}

  isConfigured(): boolean {
    return this.apiKey.trim().length > 0;
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    if (!this.isConfigured()) {
      return this.fallback.complete(request);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model ?? this.model,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 400,
          temperature: request.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.warn({ status: response.status, body: body.slice(0, 300) }, 'AI provider error');
        return this.fallback.complete(request);
      }

      const data = (await response.json()) as OpenAiChatResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        logger.warn('AI provider returned an empty completion');
        return this.fallback.complete(request);
      }

      return {
        content,
        model: data.model ?? this.model,
        provider: this.name,
        fallback: false,
      };
    } catch (error) {
      logger.warn({ err: error }, 'AI provider request failed; using fallback');
      return this.fallback.complete(request);
    } finally {
      clearTimeout(timer);
    }
  }
}

export function createOpenAiProviderFromEnv(): OpenAiChatProvider {
  return new OpenAiChatProvider(env.AI_API_KEY, env.AI_MODEL, env.AI_BASE_URL, env.AI_TIMEOUT_MS);
}
