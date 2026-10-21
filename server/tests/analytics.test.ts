import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';
import { ASSESSMENT_SEEDS } from '../src/data/assessments.js';

let app: Express;

const validAnswers = [
  { questionId: 'mood-week', value: 2 },
  { questionId: 'feeling-signals', optionIds: ['worried'] },
  { questionId: 'help-focus', optionIds: ['mood'] },
  { questionId: 'unwind-ways', optionIds: ['none'] },
  { questionId: 'preferred-mode', optionIds: ['reflection'] },
];

async function registerAdult(email = adultRegistration.email): Promise<TestClient> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', { ...adultRegistration, email });
  expect(res.status).toBe(201);
  return client;
}

describe('analytics API', () => {
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
    const { Assessment } = await import('../src/models/index.js');
    await Assessment.insertMany(ASSESSMENT_SEEDS);
  });

  it('requires authentication', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    expect((await client.get('/api/analytics/overview')).status).toBe(401);
  });

  it('returns a zeroed, non-null overview for a fresh account', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/analytics/overview');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.range.days).toBe(14);
    expect(data.totals.moodEntries).toBe(0);
    expect(data.mood.averageScore).toBeNull();
    expect(data.sleep.nightsLogged).toBe(0);
    expect(data.activity.totalMinutes).toBe(0);
    expect(data.habits.activeHabits).toBe(0);
    expect(data.latestAssessment).toBeNull();
    expect(data.wellness.level).toBeGreaterThanOrEqual(1);
  });

  it('aggregates mood, sleep, activity, habits and games into one overview', async () => {
    const client = await registerAdult();

    await client.post('/api/wellness/mood', { mood: 'great' });
    await client.post('/api/wellness/mood', { mood: 'okay' });

    const now = new Date();
    const start = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    await client.post('/api/wellness/sleep', {
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      quality: 4,
    });
    await client.post('/api/wellness/activity', { type: 'walk', durationMinutes: 30 });

    const habit = await client.post('/api/wellness/habits', { name: 'Stretch' });
    await client.post(`/api/wellness/habits/${habit.body.data.habit.id}/entries`, { completed: true });

    await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 1,
      score: 8,
      maxScore: 10,
      durationSeconds: 120,
      completed: true,
      idempotencyKey: 'agg-1',
    });

    const res = await client.get('/api/analytics/overview?days=14');
    const data = res.body.data;
    expect(data.totals.moodEntries).toBe(2);
    expect(data.mood.averageScore).toBe(4); // (5 + 3) / 2
    expect(data.totals.sleepNights).toBe(1);
    expect(data.sleep.averageDurationMinutes).toBeGreaterThan(400);
    expect(data.activity.totalMinutes).toBe(30);
    expect(data.activity.sessions).toBe(1);
    expect(data.habits.activeHabits).toBe(1);
    expect(data.habits.completionsLast7Days).toBe(1);
    expect(data.totals.gameSessions).toBe(1);
    expect(data.mood.trend).toHaveLength(14);
    expect(data.mood.trend.at(-1)?.value).toBe(4);
    expect(data.wellness.xp).toBeGreaterThan(0);
  });

  it('includes the latest assessment summary and priorities', async () => {
    const client = await registerAdult();
    await client.post('/api/assessments/emotional-wellness/responses', { answers: validAnswers });

    const res = await client.get('/api/analytics/overview');
    const latest = res.body.data.latestAssessment;
    expect(latest).not.toBeNull();
    expect(latest.code).toBe('emotional-wellness');
    expect(typeof latest.summary).toBe('string');
    expect(res.body.data.totals.assessments).toBe(1);
  });

  it('never exposes another user data', async () => {
    const owner = await registerAdult('owner-a@example.com');
    await owner.post('/api/wellness/mood', { mood: 'great' });

    const other = await registerAdult('other-a@example.com');
    const res = await other.get('/api/analytics/overview');
    expect(res.body.data.totals.moodEntries).toBe(0);
    expect(res.body.data.mood.averageScore).toBeNull();
  });

  it('rejects an out-of-range days query', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/analytics/overview?days=500');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});
