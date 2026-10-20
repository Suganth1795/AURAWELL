import { describe, expect, it, vi, afterEach } from 'vitest';
import { FallbackChatProvider } from '../src/ai/fallbackProvider.js';
import { OpenAiChatProvider } from '../src/ai/openaiProvider.js';
import { getChatProvider, setChatProvider } from '../src/ai/index.js';

afterEach(() => {
  setChatProvider(null);
  vi.restoreAllMocks();
});

describe('FallbackChatProvider', () => {
  it('always reports configured and returns non-diagnostic reflection', async () => {
    const provider = new FallbackChatProvider();
    expect(provider.isConfigured()).toBe(true);

    const result = await provider.complete({
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'I feel overwhelmed by work lately.' },
      ],
    });
    expect(result.fallback).toBe(true);
    expect(result.provider).toBe('fallback');
    expect(result.content.length).toBeGreaterThan(20);
    expect(result.content).not.toMatch(/you (have|are diagnosed with) (depression|anxiety|bipolar)/i);
    expect(result.content).toMatch(/not a doctor or therapist|wellness companion/i);
  });

  it('handles an empty conversation gracefully', async () => {
    const result = await new FallbackChatProvider().complete({ messages: [] });
    expect(result.content.length).toBeGreaterThan(10);
  });
});

describe('OpenAiChatProvider', () => {
  it('degrades to fallback when no key is configured', async () => {
    const provider = new OpenAiChatProvider('', 'gpt-4o-mini', 'https://api.openai.com/v1', 1000);
    expect(provider.isConfigured()).toBe(false);
    const result = await provider.complete({ messages: [{ role: 'user', content: 'hello' }] });
    expect(result.fallback).toBe(true);
  });

  it('returns the model completion on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: 'gpt-4o-mini',
        choices: [{ message: { content: 'A supportive reply.' } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new OpenAiChatProvider('sk-test', 'gpt-4o-mini', 'https://api.test/v1', 1000);
    const result = await provider.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(result.fallback).toBe(false);
    expect(result.content).toBe('A supportive reply.');
    expect(result.model).toBe('gpt-4o-mini');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back when the upstream returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' }));
    const provider = new OpenAiChatProvider('sk-test', 'gpt-4o-mini', 'https://api.test/v1', 1000);
    const result = await provider.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(result.fallback).toBe(true);
  });

  it('falls back when the request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const provider = new OpenAiChatProvider('sk-test', 'gpt-4o-mini', 'https://api.test/v1', 1000);
    const result = await provider.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(result.fallback).toBe(true);
  });
});

describe('provider factory', () => {
  it('uses the deterministic fallback when no API key is present', () => {
    setChatProvider(null);
    const provider = getChatProvider();
    expect(provider.name).toBe('fallback');
    expect(provider.isConfigured()).toBe(true);
  });
});
