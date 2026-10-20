import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Express } from 'express';
import { setChatProvider } from '../src/ai/index.js';
import type { ChatProvider } from '../src/ai/types.js';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

async function register(
  client: TestClient,
  overrides: Record<string, unknown> = {},
): Promise<void> {
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', { ...adultRegistration, ...overrides });
  expect(res.status).toBe(201);
}

async function createSession(client: TestClient): Promise<string> {
  const res = await client.post('/api/counseling/sessions', {});
  expect(res.status).toBe(201);
  return res.body.data.session.id as string;
}

describe('counseling (AURA)', () => {
  beforeAll(async () => {
    await connectTestDb();
    const { createApp } = await import('../src/app.js');
    app = createApp();
  });
  afterAll(async () => {
    await closeTestDb();
  });
  beforeEach(async () => {
    await cleanTestDb();
    setChatProvider(null);
  });

  it('returns an intro with disclaimer, resources and age-appropriate activities', async () => {
    const client = new TestClient(app);
    await register(client);
    const res = await client.get('/api/counseling/intro');
    expect(res.status).toBe(200);
    expect(res.body.data.disclaimer).toMatch(/not a doctor or therapist/i);
    expect(res.body.data.crisisResources.length).toBeGreaterThan(0);
    expect(res.body.data.suggestedActivities.length).toBeGreaterThan(0);
  });

  it('creates a session and replies with the deterministic fallback when no provider is set', async () => {
    const client = new TestClient(app);
    await register(client);
    const id = await createSession(client);

    const res = await client.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'I have been feeling stressed about exams.',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.userMessage.role).toBe('user');
    expect(res.body.data.assistantMessage.role).toBe('assistant');
    expect(res.body.data.assistantMessage.source).toBe('fallback');
    expect(res.body.data.assistantMessage.safetyLevel).toBe('none');
  });

  it('handles a crisis message with canned support and records a safety flag', async () => {
    const client = new TestClient(app);
    await register(client);
    const id = await createSession(client);

    const res = await client.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'I want to kill myself',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.assistantMessage.source).toBe('canned');
    expect(res.body.data.assistantMessage.safetyLevel).toBe('crisis_support');
    expect(res.body.data.assistantMessage.content).toContain('988');

    const detail = await client.get(`/api/counseling/sessions/${id}`);
    expect(detail.body.data.session.safetyFlags).toContain('possible_self_harm');
  });

  it('redirects medical questions instead of answering them', async () => {
    const client = new TestClient(app);
    await register(client);
    const id = await createSession(client);
    const res = await client.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'What dosage of medication should I take for my anxiety?',
    });
    expect(res.body.data.assistantMessage.safetyLevel).toBe('boundary_redirect');
    expect(res.body.data.assistantMessage.content).toMatch(/professional/i);
  });

  it('gives children curated activities and never calls an LLM', async () => {
    const spy = vi.fn();
    const provider: ChatProvider = {
      name: 'spy',
      isConfigured: () => true,
      complete: async (req) => {
        spy(req);
        return { content: 'LLM used', model: 'x', provider: 'spy', fallback: false };
      },
    };
    setChatProvider(provider);

    const child = new TestClient(app);
    await register(child, {
      email: 'child@example.com',
      birthYear: new Date().getFullYear() - 9,
      guardianConsent: true,
    });
    // Child consents cannot be interpreted as AI data consent.
    const id = await createSession(child);
    const res = await child.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'I feel sad sometimes.',
    });
    expect(res.body.data.assistantMessage.source).toBe('canned');
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not contact a configured provider without AI data consent', async () => {
    const spy = vi.fn();
    const provider: ChatProvider = {
      name: 'spy',
      isConfigured: () => true,
      complete: async () => {
        spy();
        return { content: 'LLM reply', model: 'spy', provider: 'spy', fallback: false };
      },
    };
    setChatProvider(provider);

    const client = new TestClient(app);
    await register(client); // default aiWellnessDataConsent = false
    const id = await createSession(client);
    const res = await client.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'I want to reflect on my week.',
    });
    expect(spy).not.toHaveBeenCalled();
    expect(res.body.data.assistantMessage.source).toBe('fallback');
  });

  it('uses the configured provider for adults who granted AI data consent', async () => {
    const provider: ChatProvider = {
      name: 'spy',
      isConfigured: () => true,
      complete: async () => ({ content: 'A real model reply.', model: 'spy', provider: 'spy', fallback: false }),
    };
    setChatProvider(provider);

    const client = new TestClient(app);
    await register(client);
    await client.put('/api/users/preferences', { aiWellnessDataConsent: true });

    const id = await createSession(client);
    const res = await client.post(`/api/counseling/sessions/${id}/messages`, {
      content: 'I want to reflect on my week.',
    });
    expect(res.body.data.assistantMessage.source).toBe('llm');
    expect(res.body.data.assistantMessage.content).toBe('A real model reply.');
  });

  it('titles the session from the first message and lists sessions', async () => {
    const client = new TestClient(app);
    await register(client);
    const id = await createSession(client);
    await client.post(`/api/counseling/sessions/${id}/messages`, { content: 'My sleep has been poor' });

    const list = await client.get('/api/counseling/sessions');
    expect(list.body.data.sessions[0].title).toMatch(/My sleep has been poor/);
  });

  it('rejects messages to a closed session and supports close/delete', async () => {
    const client = new TestClient(app);
    await register(client);
    const id = await createSession(client);
    await client.post(`/api/counseling/sessions/${id}/messages`, { content: 'hello' });

    const closed = await client.post(`/api/counseling/sessions/${id}/close`);
    expect(closed.body.data.session.status).toBe('closed');

    const send = await client.post(`/api/counseling/sessions/${id}/messages`, { content: 'again' });
    expect(send.status).toBe(400);
    expect(send.body.error.code).toBe('session_closed');

    const del = await client.delete(`/api/counseling/sessions/${id}`);
    expect(del.status).toBe(200);
    const gone = await client.get(`/api/counseling/sessions/${id}`);
    expect(gone.status).toBe(404);
  });

  it('does not expose another user conversation', async () => {
    const owner = new TestClient(app);
    await register(owner);
    const id = await createSession(owner);

    const other = new TestClient(app);
    await register(other, { email: 'other-c@example.com' });
    const res = await other.get(`/api/counseling/sessions/${id}`);
    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    expect((await client.get('/api/counseling/sessions')).status).toBe(401);
    expect((await client.get('/api/ai/status')).status).toBe(401);
  });

  it('reports AI provider status', async () => {
    const client = new TestClient(app);
    await register(client);
    const res = await client.get('/api/ai/status');
    expect(res.status).toBe(200);
    expect(res.body.data.provider).toBe('fallback');
  });
});
