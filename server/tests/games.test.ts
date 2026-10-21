import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
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

describe('games API (MindPlay)', () => {
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

  it('rejects unauthenticated catalogue access', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.get('/api/games');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthenticated');
  });

  it('lists games available to the user age group with run metadata', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/games');
    expect(res.status).toBe(200);
    const games = res.body.data.games as { code: string; mechanic: string; instructions: string }[];
    expect(games.length).toBeGreaterThan(0);
    const codes = games.map((g) => g.code);
    expect(codes).toContain('memory-garden');
    expect(codes).toContain('calm-dragon');
    expect(codes).not.toContain('story-choices'); // child/teen only
    for (const game of games) {
      expect(game.mechanic).toBeTruthy();
      expect(game.instructions.length).toBeGreaterThan(10);
    }
  });

  it('returns a single game with its mechanic settings', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/games/calm-dragon');
    expect(res.status).toBe(200);
    expect(res.body.data.game.mechanic).toBe('breathing');
    expect(res.body.data.game.settings).toMatchObject({ breathIn: 4, breathOut: 6 });
  });

  it('404s an unknown game and 403s an age-restricted game', async () => {
    const client = await registerAdult();
    const missing = await client.get('/api/games/not-a-real-game');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('not_found');

    const child = new TestClient(app);
    await child.bootstrapCsrf();
    const register = await child.post('/api/auth/register', {
      email: 'child-player@example.com',
      password: 'Wellness!42',
      displayName: 'Cara Child',
      birthYear: new Date().getFullYear() - 9,
      guardianConsent: true,
      guardianName: 'Parent One',
      consents: { termsOfService: true, privacyPolicy: true, aiWellnessData: false },
    });
    expect(register.status).toBe(201);
    const blocked = await child.get('/api/games/cognitive-sprint');
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('age_restricted');
  });

  it('records a session, awards XP and extends the streak', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 2,
      score: 8,
      maxScore: 10,
      durationSeconds: 180,
      completed: true,
      idempotencyKey: 'round-1',
    });
    expect(res.status).toBe(201);

    const { session, reward, progress } = res.body.data;
    expect(session.gameCode).toBe('memory-garden');
    expect(session.accuracy).toBeCloseTo(0.8, 5);
    expect(reward.awardedXp).toBeGreaterThan(0);
    expect(reward.xp).toBe(reward.awardedXp);
    expect(reward.streakDays).toBe(1);
    expect(progress.level).toBeGreaterThanOrEqual(1);
    expect(res.body.data.user.wellness.xp).toBe(reward.xp);
  });

  it('is idempotent per key and does not double-reward', async () => {
    const client = await registerAdult();
    const payload = {
      gameCode: 'focus-quest',
      difficulty: 1,
      score: 5,
      maxScore: 5,
      durationSeconds: 120,
      completed: true,
      idempotencyKey: 'same-key',
    };
    const first = await client.post('/api/games/sessions', payload);
    expect(first.status).toBe(201);
    const firstXp = first.body.data.reward.xp;

    const second = await client.post('/api/games/sessions', payload);
    expect(second.status).toBe(200);
    expect(second.body.data.duplicate).toBe(true);
    expect(second.body.data.reward.awardedXp).toBe(0);
    expect(second.body.data.reward.xp).toBe(firstXp);

    const { GameSession } = await import('../src/models/index.js');
    expect(await GameSession.countDocuments()).toBe(1);
  });

  it('caps XP at the game maximum and ignores fraudulent client values', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/games/sessions', {
      gameCode: 'calm-dragon',
      difficulty: 5,
      score: 5000,
      maxScore: 5000,
      durationSeconds: 7200,
      completed: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.reward.awardedXp).toBeLessThanOrEqual(35);
    expect(res.body.data.session.score).toBe(5000);
  });

  it('rejects unknown games and invalid values', async () => {
    const client = await registerAdult();
    const unknown = await client.post('/api/games/sessions', {
      gameCode: 'not-a-real-game',
      difficulty: 1,
      score: 1,
      maxScore: 1,
      durationSeconds: 10,
      completed: true,
    });
    expect(unknown.status).toBe(400);
    expect(unknown.body.error.code).toBe('unknown_game');

    const negative = await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 1,
      score: -5,
      maxScore: 10,
      durationSeconds: 10,
      completed: true,
    });
    expect(negative.status).toBe(400);
    expect(negative.body.error.code).toBe('validation_error');
  });

  it('marks a matching game recommendation as completed', async () => {
    const client = await registerAdult();
    const { Recommendation, User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: adultRegistration.email });
    await Recommendation.create({
      userId: user!._id,
      kind: 'game',
      code: 'memory-garden',
      title: 'Memory Garden',
      description: 'Play',
      explanation: 'Because memory',
      source: 'assessment',
      status: 'suggested',
    });

    const res = await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 1,
      score: 5,
      maxScore: 5,
      durationSeconds: 60,
      completed: true,
    });
    expect(res.status).toBe(201);

    const updated = await Recommendation.findOne({ userId: user!._id, code: 'memory-garden' });
    expect(updated?.status).toBe('completed');
    expect(updated?.completedAt).toBeInstanceOf(Date);
  });

  it('returns session history and per-game stats without comparisons', async () => {
    const client = await registerAdult();
    await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 1,
      score: 6,
      maxScore: 10,
      durationSeconds: 90,
      completed: true,
    });
    await client.post('/api/games/sessions', {
      gameCode: 'memory-garden',
      difficulty: 2,
      score: 9,
      maxScore: 10,
      durationSeconds: 100,
      completed: true,
    });

    const history = await client.get('/api/games/sessions?page=1&limit=10');
    expect(history.status).toBe(200);
    expect(history.body.data.items).toHaveLength(2);
    expect(history.body.data.total).toBe(2);

    const stats = await client.get('/api/games/stats');
    expect(stats.status).toBe(200);
    const memory = stats.body.data.stats.find(
      (s: { gameCode: string }) => s.gameCode === 'memory-garden',
    );
    expect(memory.plays).toBe(2);
    expect(memory.bestScore).toBe(9);
    expect(stats.body.data.progress).toHaveProperty('xpForNextLevel');
    expect(JSON.stringify(stats.body.data)).not.toMatch(/leaderboard|rank|other users/i);
  });

  it('caps total game XP per UTC day regardless of how many games are played', async () => {
    const client = await registerAdult();
    const single = {
      difficulty: 5,
      score: 5000,
      maxScore: 5000,
      durationSeconds: 7200,
      completed: true,
    };
    let totalAwarded = 0;
    // Play far more than the daily cap allows; each session is near game.maxXp.
    for (let i = 0; i < 20; i += 1) {
      const res = await client.post('/api/games/sessions', {
        ...single,
        gameCode: 'calm-dragon',
      });
      expect(res.status).toBe(201);
      totalAwarded += res.body.data.reward.awardedXp as number;
    }
    const { DAILY_GAME_XP_CAP } = await import('../src/services/gameProgress.service.js');
    expect(totalAwarded).toBeLessThanOrEqual(DAILY_GAME_XP_CAP);
  });

  it('does not mutate persisted streak state on a duplicate submission', async () => {
    const client = await registerAdult();
    const payload = {
      gameCode: 'focus-quest',
      difficulty: 1,
      score: 5,
      maxScore: 5,
      durationSeconds: 60,
      completed: true,
      idempotencyKey: 'dup-streak',
    };
    const first = await client.post('/api/games/sessions', payload);
    const streakAfterFirst = first.body.data.reward.streakDays;

    const duplicate = await client.post('/api/games/sessions', payload);
    expect(duplicate.body.data.duplicate).toBe(true);
    const stats = await client.get('/api/games/stats');
    expect(stats.body.data.progress.level).toBeGreaterThanOrEqual(1);
    // The duplicate response must reflect stored state, not an unpersisted bump.
    expect(duplicate.body.data.reward.streakDays).toBe(streakAfterFirst);
  });
});
