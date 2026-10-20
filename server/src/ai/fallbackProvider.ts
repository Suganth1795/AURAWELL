import type { ChatProvider, CompletionRequest, CompletionResult } from './types.js';

/**
 * Deterministic, offline reflection provider. It never contacts a network and
 * produces a supportive, non-diagnostic reflection based on the latest user
 * message. Used whenever no AI key is configured, when consent is missing, or
 * when the upstream provider fails — so the companion always answers.
 */
export class FallbackChatProvider implements ChatProvider {
  readonly name = 'fallback';

  isConfigured(): boolean {
    return true;
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const lastUser = [...request.messages].reverse().find((m) => m.role === 'user');
    const content = reflect(lastUser?.content ?? '');
    return {
      content,
      model: 'deterministic-fallback',
      provider: this.name,
      fallback: true,
    };
  }
}

const OPENERS = [
  'Thank you for sharing that with me.',
  "It sounds like you're carrying something real right now.",
  'I hear you, and what you feel makes sense.',
  "Thanks for trusting me with that.",
];

function pick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return items[hash % items.length];
}

function reflect(text: string): string {
  const trimmed = text.trim();
  const opener = pick(OPENERS, trimmed || 'empty');

  if (!trimmed) {
    return [
      opener,
      '',
      'I can help you reflect. If you like, tell me what has been on your mind, or what feels heaviest today.',
      '',
      'Whenever you are ready, we can look at one small next step together.',
    ].join('\n');
  }

  const question = pick(
    [
      'What feels most important about this for you right now?',
      'If a close friend described this to you, what would you say to them?',
      'What is one small thing that might make today 1% lighter?',
      'Which part of this is within your control, and which part is not?',
    ],
    trimmed,
  );

  return [
    opener,
    '',
    `Here is a reflection of what I noticed: you mentioned "${summarize(trimmed)}". Naming it is a meaningful first step.`,
    '',
    question,
    '',
    'Remember, I am a wellness companion — not a doctor or therapist. If things feel overwhelming, reaching out to a trusted person or a professional can help.',
  ].join('\n');
}

function summarize(text: string): string {
  const short = text.replace(/\s+/g, ' ').slice(0, 120);
  return text.length > 120 ? `${short}…` : short;
}
