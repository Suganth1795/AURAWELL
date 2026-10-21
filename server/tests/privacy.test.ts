import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

async function registerAdult(email = adultRegistration.email): Promise<TestClient> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', { ...adultRegistration, email });
  expect(res.status).toBe(201);
  return client;
}

describe('privacy API', () => {
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
  });

  it('requires authentication', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    expect((await client.get('/api/privacy/overview')).status).toBe(401);
    expect((await client.get('/api/privacy/export')).status).toBe(401);
  });

  it('reports consent state and data counts', async () => {
    const client = await registerAdult();
    await client.put('/api/users/preferences', { aiWellnessDataConsent: true });
    await client.post('/api/wellness/mood', { mood: 'okay' });

    const res = await client.get('/api/privacy/overview');
    expect(res.status).toBe(200);
    expect(res.body.data.consents.current.aiWellnessDataConsent).toBe(true);
    expect(res.body.data.counts.mood).toBe(1);
    expect(res.body.data.export.available).toBe(true);
    expect(res.body.data.account.status).toBe('active');
    const types = res.body.data.consents.history.map((h: { type: string }) => h.type);
    expect(types).toContain('terms_of_service');
  });

  it('exports everything AuraWell stores without leaking secrets', async () => {
    const client = await registerAdult();
    await client.post('/api/wellness/mood', { mood: 'great', note: 'sunny' });
    await client.post('/api/wellness/journal', { content: 'A private thought.' });

    const res = await client.get('/api/privacy/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('aurawell-export.json');
    const bundle = res.body.data;
    expect(bundle.formatVersion).toBe('1.0');
    expect(bundle.profile.email).toBe(adultRegistration.email);
    expect(bundle.profile).not.toHaveProperty('passwordHash');
    expect(bundle.mood).toHaveLength(1);
    expect(bundle.mood[0].note).toBe('sunny');
    expect(bundle.journal).toHaveLength(1);
    expect(bundle.journal[0].content).toBe('A private thought.');
    expect(bundle.consents.current.aiWellnessDataConsent).toBe(false);
  });

  it('does not export another user data', async () => {
    const owner = await registerAdult('owner-p@example.com');
    await owner.post('/api/wellness/mood', { mood: 'great' });

    const other = await registerAdult('other-p@example.com');
    const res = await other.get('/api/privacy/export');
    expect(res.body.data.mood).toHaveLength(0);
  });
});
