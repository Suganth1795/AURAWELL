import { env } from '../config/env.js';
import { FallbackChatProvider } from './fallbackProvider.js';
import { createOpenAiProviderFromEnv } from './openaiProvider.js';
import type { ChatProvider } from './types.js';

let cached: ChatProvider | null = null;

/**
 * Resolves the active chat provider from configuration. When no key is set (or
 * the provider is explicitly disabled) the deterministic fallback is used.
 */
export function getChatProvider(): ChatProvider {
  if (cached) return cached;

  if (env.AI_PROVIDER === 'none' || env.AI_API_KEY.trim().length === 0) {
    cached = new FallbackChatProvider();
    return cached;
  }

  // OpenAI and Anthropic-compatible gateways both expose the chat/completions shape
  // through configurable base URLs in this build.
  cached = createOpenAiProviderFromEnv();
  return cached;
}

/** Test seam: overrides the provider and clears the memoised instance. */
export function setChatProvider(provider: ChatProvider | null): void {
  cached = provider;
}

export type { ChatProvider, ChatMessage, CompletionRequest, CompletionResult } from './types.js';
export { FallbackChatProvider } from './fallbackProvider.js';
export { OpenAiChatProvider } from './openaiProvider.js';
