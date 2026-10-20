export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Overrides the default model for this call. */
  model?: string;
}

export interface CompletionResult {
  content: string;
  model: string;
  provider: string;
  /** True when no real model was used (deterministic fallback). */
  fallback: boolean;
}

/**
 * Provider-neutral chat completion contract. Implementations must never throw
 * for transient upstream failures if a usable result can be produced; instead
 * callers should be given a fallback so the user experience never dead-ends.
 */
export interface ChatProvider {
  readonly name: string;
  isConfigured(): boolean;
  complete(request: CompletionRequest): Promise<CompletionResult>;
}
