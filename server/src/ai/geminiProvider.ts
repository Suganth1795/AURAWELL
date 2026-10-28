import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { FallbackChatProvider } from './fallbackProvider.js';
import type { ChatProvider, CompletionRequest, CompletionResult } from './types.js';

interface GeminiChatResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message?: string; code?: number };
}

const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function normalizeModel(model: string): string {
  // Accept either "gemini-3.5-flash" or "models/gemini-3.5-flash"
  return model.replace(/^models\//, '');
}

function toGeminiContents(messages: CompletionRequest['messages']): {
  systemInstruction?: { parts: { text: string }[] };
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
} {
  let systemInstruction: { parts: { text: string }[] } | undefined;
  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      if (systemInstruction) {
        systemInstruction.parts.push({ text: message.content });
      } else {
        systemInstruction = { parts: [{ text: message.content }] };
      }
      continue;
    }

    // Gemini uses "user" and "model" roles (not "assistant")
    const role = message.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: message.content }],
    });
  }

  return { systemInstruction, contents };
}

/**
 * Google Gemini provider using the generateContent API.
 * Falls back to the deterministic provider on any failure to keep AURA safe and usable.
 */
export class GeminiChatProvider implements ChatProvider {
  readonly name = 'gemini';
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
      const model = normalizeModel(request.model ?? this.model);
      const baseUrl = (this.baseUrl.trim() || DEFAULT_GEMINI_BASE_URL).replace(/\/$/, '');
      const endpoint = `${baseUrl}/models/${model}:generateContent`;

      const { systemInstruction, contents } = toGeminiContents(request.messages);
      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.7,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      };

      if (systemInstruction) {
        body.systemInstruction = systemInstruction;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        logger.warn({ status: response.status, body: bodyText.slice(0, 300) }, 'AI provider error');
        return this.fallback.complete(request);
      }

      const data = (await response.json()) as GeminiChatResponse;
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!content) {
        logger.warn('AI provider returned an empty completion');
        return this.fallback.complete(request);
      }

      return {
        content,
        model,
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

export function createGeminiProviderFromEnv(): GeminiChatProvider {
  const baseUrl = env.AI_BASE_URL.trim() || DEFAULT_GEMINI_BASE_URL;
  return new GeminiChatProvider(env.AI_API_KEY, env.AI_MODEL, baseUrl, env.AI_TIMEOUT_MS);
}
