import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { Recommendation } from '../src/models/index.js';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

async function registerAdult(): Promise<TestClient> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', adultRegistration);
  expect(res.status).toBe(201);
  return client;
}

async function seedRecommendation(userId: string, overrides: Record<string, unknown> = {}) {
  return Recommendation.create({
    userId,
    kind: 'activity',
    code: 'act-gentle-mobility',
    title: 'Gentle mobility',
    description: 'A short stretch',
    explanation: 'Because you reported low energy',
    estimatedMinutes: 5,
    source: 'rules',
    score: 10,
    ...overrides,
  });
}

describe('recommendations', () => {
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

  it('lists recommendations sorted by score and filters by status', async () => {
    const client = await registerAdult();
    const { User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: adultRegistration.email });
    await seedRecommendation(String(user!._id), { score: 5, code: 'low' });
    await seedRecommendation(String(user!._id), { score: 20, code: 'high' });
    await seedRecommendation(String(user!._id), { score: 30, code: 'done', status: 'completed' });

    const all = await client.get('/api/recommendations');
    expect(all.status).toBe(200);
    expect(all.body.data.recommendations.map((r: { code: string }) => r.code)).toEqual(['done', 'high', 'low']);

    const suggested = await client.get('/api/recommendations?status=suggested');
    expect(suggested.body.data.recommendations).toHaveLength(2);
  });

  it('accepts, completes and gives feedback on a recommendation', async () => {
    const client = await registerAdult();
    const { User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: adultRegistration.email });
    const rec = await seedRecommendation(String(user!._id));

    const accepted = await client.patch(`/api/recommendations/${rec._id}`, { status: 'accepted' });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.recommendation.status).toBe('accepted');

    const completed = await client.patch(`/api/recommendations/${rec._id}`, {
      status: 'completed',
      feedbackHelpful: true,
    });
    expect(completed.body.data.recommendation.status).toBe('completed');
    expect(completed.body.data.recommendation.feedbackHelpful).toBe(true);
    expect(completed.body.data.recommendation.completedAt).toBeTruthy();
  });

  it('does not allow updating another user recommendation', async () => {
    const client = await registerAdult();
    const { User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: adultRegistration.email });
    const rec = await seedRecommendation(String(user!._id));
    await client.post('/api/auth/logout');

    const other = new TestClient(app);
    await other.bootstrapCsrf();
    await other.post('/api/auth/register', { ...adultRegistration, email: 'other2@example.com' });

    const res = await other.patch(`/api/recommendations/${rec._id}`, { status: 'dismissed' });
    expect(res.status).toBe(404);
  });
});
