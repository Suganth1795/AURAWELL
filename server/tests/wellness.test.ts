import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

async function registerAdult(email = 'wellness@example.com'): Promise<TestClient> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', { ...adultRegistration, email });
  expect(res.status).toBe(201);
  return client;
}

describe('mood tracking', () => {
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

  it('records a mood entry and grants a daily reward', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/wellness/mood', {
      mood: 'good',
      intensity: 4,
      note: 'Sunny walk',
      activities: ['walk'],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.entry.mood).toBe('good');
    expect(res.body.data.entry.score).toBe(4);
    expect(res.body.data.reward.xpAwarded).toBe(5);
    expect(res.body.data.reward.streakDays).toBe(1);
  });

  it('grants XP only once per day but refreshes the streak', async () => {
    const client = await registerAdult();
    const first = await client.post('/api/wellness/mood', { mood: 'okay' });
    const second = await client.post('/api/wellness/mood', { mood: 'great' });
    expect(first.body.data.reward.xpAwarded).toBe(5);
    expect(second.body.data.reward.xpAwarded).toBe(0);
    expect(second.body.data.reward.xp).toBe(5);
    expect(second.body.data.reward.streakDays).toBe(1);
  });

  it('reports today and a daily-average trend, with honest gaps', async () => {
    const client = await registerAdult();
    await client.post('/api/wellness/mood', { mood: 'great' });
    await client.post('/api/wellness/mood', { mood: 'low' });

    const today = await client.get('/api/wellness/mood/today');
    expect(today.status).toBe(200);
    expect(today.body.data.entries).toHaveLength(2);

    const trend = await client.get('/api/wellness/mood/trend?days=7');
    expect(trend.status).toBe(200);
    const points = trend.body.data.trend as { dayKey: string; average: number | null; entryCount: number }[];
    expect(points).toHaveLength(7);
    const last = points[points.length - 1];
    expect(last.entryCount).toBe(2);
    expect(last.average).toBe(3.5); // (5 + 2) / 2
    expect(points[0].average).toBeNull();
  });

  it('rejects invalid mood values and deletes entries', async () => {
    const client = await registerAdult();
    const bad = await client.post('/api/wellness/mood', { mood: 'elated' });
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('validation_error');

    const created = await client.post('/api/wellness/mood', { mood: 'okay' });
    const id = created.body.data.entry.id;
    const del = await client.delete(`/api/wellness/mood/${id}`);
    expect(del.status).toBe(200);
    const list = await client.get('/api/wellness/mood');
    expect(list.body.data.items).toHaveLength(0);
  });

  it('requires authentication', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.get('/api/wellness/mood');
    expect(res.status).toBe(401);
  });
});

describe('journal', () => {
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

  it('lists age-appropriate prompts', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/wellness/journal/prompts');
    expect(res.status).toBe(200);
    expect(res.body.data.prompts.length).toBeGreaterThan(0);
    for (const prompt of res.body.data.prompts) {
      expect(prompt.title).toBeTruthy();
    }
  });

  it('creates, reads, updates and soft-deletes an entry', async () => {
    const client = await registerAdult();
    const created = await client.post('/api/wellness/journal', {
      title: 'Evening',
      content: 'Today I felt steady.',
      tags: ['calm'],
    });
    expect(created.status).toBe(201);
    const id = created.body.data.entry.id;

    const fetched = await client.get(`/api/wellness/journal/${id}`);
    expect(fetched.body.data.entry.title).toBe('Evening');

    const updated = await client.patch(`/api/wellness/journal/${id}`, { content: 'Updated body.' });
    expect(updated.body.data.entry.content).toBe('Updated body.');

    const del = await client.delete(`/api/wellness/journal/${id}`);
    expect(del.status).toBe(200);
    const list = await client.get('/api/wellness/journal');
    expect(list.body.data.items).toHaveLength(0);
    const gone = await client.get(`/api/wellness/journal/${id}`);
    expect(gone.status).toBe(404);
  });

  it('rejects an unknown prompt id', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/wellness/journal', {
      content: 'hi',
      promptId: 'not-a-prompt',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('unknown_prompt');
  });

  it('does not expose another user entry', async () => {
    const owner = await registerAdult('owner@example.com');
    const created = await owner.post('/api/wellness/journal', { content: 'private' });
    const id = created.body.data.entry.id;

    const other = await registerAdult('other@example.com');
    const res = await other.get(`/api/wellness/journal/${id}`);
    expect(res.status).toBe(404);
  });
});

describe('sleep and activity', () => {
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

  it('records sleep, computes duration and summarises', async () => {
    const client = await registerAdult();
    const wake = new Date();
    wake.setUTCHours(7, 0, 0, 0);
    const start = new Date(wake.getTime() - 8 * 60 * 60 * 1000);
    const res = await client.post('/api/wellness/sleep', {
      startTime: start.toISOString(),
      endTime: wake.toISOString(),
      quality: 4,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.entry.durationMinutes).toBe(480);

    const summary = await client.get('/api/wellness/sleep/summary?days=5');
    expect(summary.status).toBe(200);
    expect(summary.body.data.summary.nightsLogged).toBe(1);
    expect(summary.body.data.summary.averageDurationMinutes).toBe(480);
    expect(summary.body.data.summary.lastNight.durationMinutes).toBe(480);
  });

  it('rejects implausible or inverted sleep ranges', async () => {
    const client = await registerAdult();
    const inverted = await client.post('/api/wellness/sleep', {
      startTime: '2026-01-02T07:00:00.000Z',
      endTime: '2026-01-02T06:00:00.000Z',
      quality: 3,
    });
    expect(inverted.status).toBe(400);
    expect(inverted.body.error.code).toBe('invalid_range');

    const tooLong = await client.post('/api/wellness/sleep', {
      startTime: '2026-01-01T00:00:00.000Z',
      endTime: '2026-01-01T20:00:00.000Z',
      quality: 3,
    });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.code).toBe('implausible_duration');
  });

  it('records activity and summarises minutes without comparing users', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/wellness/activity', {
      type: 'walk',
      durationMinutes: 30,
      steps: 4000,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.entry.type).toBe('walk');

    const summary = await client.get('/api/wellness/activity/summary?days=7');
    expect(summary.status).toBe(200);
    expect(summary.body.data.summary.totalMinutes).toBe(30);
    expect(summary.body.data.summary.totalSessions).toBe(1);
    expect(summary.body.data.summary.series).toHaveLength(7);
    expect(JSON.stringify(summary.body)).not.toMatch(/rank|leaderboard|calorie/i);
  });

  it('rejects unknown activity types', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/wellness/activity', {
      type: 'skydiving',
      durationMinutes: 30,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});

describe('habits', () => {
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

  it('creates a habit and toggles completion for today', async () => {
    const client = await registerAdult();
    const created = await client.post('/api/wellness/habits', {
      name: 'Drink water',
      category: 'custom',
      frequency: 'daily',
      emoji: '💧',
    });
    expect(created.status).toBe(201);
    const id = created.body.data.habit.id;

    const toggle = await client.post(`/api/wellness/habits/${id}/entries`, { completed: true });
    expect(toggle.status).toBe(200);
    expect(toggle.body.data.completed).toBe(true);
    expect(toggle.body.data.reward.xpAwarded).toBe(5);

    const list = await client.get('/api/wellness/habits');
    const habit = list.body.data.habits[0];
    expect(habit.completedToday).toBe(true);
    expect(habit.currentStreak).toBe(1);
    expect(habit.recentDays).toHaveLength(7);
    expect(habit.weeklyTarget).toBe(7);
  });

  it('un-completes a habit and removes the entry', async () => {
    const client = await registerAdult();
    const created = await client.post('/api/wellness/habits', { name: 'Stretch' });
    const id = created.body.data.habit.id;

    await client.post(`/api/wellness/habits/${id}/entries`, { completed: true });
    const off = await client.post(`/api/wellness/habits/${id}/entries`, { completed: false });
    expect(off.body.data.completed).toBe(false);
    expect(off.body.data.entryId).toBeNull();

    const list = await client.get('/api/wellness/habits');
    expect(list.body.data.habits[0].completedToday).toBe(false);
    expect(list.body.data.habits[0].currentStreak).toBe(0);
  });

  it('updates and archives a habit, and 404s unknown ids', async () => {
    const client = await registerAdult();
    const created = await client.post('/api/wellness/habits', { name: 'Read' });
    const id = created.body.data.habit.id;

    const updated = await client.patch(`/api/wellness/habits/${id}`, { name: 'Read a chapter', archived: true });
    expect(updated.body.data.habit.name).toBe('Read a chapter');
    expect(updated.body.data.habit.archived).toBe(true);

    const list = await client.get('/api/wellness/habits');
    expect(list.body.data.habits).toHaveLength(0);
    const withArchived = await client.get('/api/wellness/habits?includeArchived=true');
    expect(withArchived.body.data.habits).toHaveLength(1);

    const missing = await client.post('/api/wellness/habits/000000000000000000000000/entries', { completed: true });
    expect(missing.status).toBe(404);
  });

  it('toggles completion for an explicit past day', async () => {
    const client = await registerAdult();
    const created = await client.post('/api/wellness/habits', { name: 'Journal' });
    const id = created.body.data.habit.id;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const res = await client.post(`/api/wellness/habits/${id}/entries`, { completed: true, dayKey: yesterday });
    expect(res.body.data.dayKey).toBe(yesterday);
    const list = await client.get('/api/wellness/habits');
    expect(list.body.data.habits[0].completedToday).toBe(false);
    expect(list.body.data.habits[0].currentStreak).toBe(1);
  });
});
