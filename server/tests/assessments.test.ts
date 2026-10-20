import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';
import { ASSESSMENT_SEEDS } from '../src/data/assessments.js';

let app: Express;

const validAnswers = [
  { questionId: 'mood-week', value: 2 },
  { questionId: 'feeling-signals', optionIds: ['worried', 'sad'] },
  { questionId: 'help-focus', optionIds: ['mood'] },
  { questionId: 'unwind-ways', optionIds: ['none'] },
  { questionId: 'preferred-mode', optionIds: ['reflection'] },
];

async function registerAdult(): Promise<TestClient> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', adultRegistration);
  expect(res.status).toBe(201);
  return client;
}

describe('assessments API', () => {
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

  it('rejects unauthenticated catalogue access', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.get('/api/assessments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthenticated');
  });

  it('lists published assessments available to the user age group', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/assessments');
    expect(res.status).toBe(200);
    const codes = res.body.data.assessments.map((a: { code: string }) => a.code);
    expect(codes).toContain('emotional-wellness');
    expect(codes).toContain('sleep-habits');
    expect(codes).toContain('focus-concentration');
    for (const assessment of res.body.data.assessments) {
      expect(assessment).toHaveProperty('questionCount');
      expect(assessment).toHaveProperty('disclaimer');
    }
  });

  it('returns a runnable assessment without leaking interpretation tags', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/assessments/emotional-wellness');
    expect(res.status).toBe(200);
    const assessment = res.body.data.assessment;
    expect(assessment.code).toBe('emotional-wellness');
    expect(assessment.intro).toMatch(/not a diagnostic test/i);
    expect(assessment.questions.length).toBeGreaterThan(3);
    for (const question of assessment.questions) {
      expect(question).not.toHaveProperty('ratingRules');
      expect(question).not.toHaveProperty('ageVariants');
      for (const option of question.options) {
        expect(option).not.toHaveProperty('tags');
        expect(option).not.toHaveProperty('weight');
      }
    }
  });

  it('404s an unknown assessment code', async () => {
    const client = await registerAdult();
    const res = await client.get('/api/assessments/not-a-real-code');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('submits answers and returns a structured, actionable result', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/assessments/emotional-wellness/responses', {
      answers: validAnswers,
    });
    expect(res.status).toBe(201);

    const result = res.body.data.result;
    expect(result.summary).toContain('Ada Adult');
    expect(result.matchedRules).toEqual(expect.arrayContaining(['low-mood-support', 'stress-signals']));
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(result.sevenDayPlan).toHaveLength(7);
    expect(result.disclaimer).toMatch(/not a diagnosis/i);

    expect(result.indicators).toHaveProperty('emotions');
    expect(result.indicators.emotions).toBeGreaterThanOrEqual(5);
    expect(result.indicators.emotions).toBeLessThan(100);

    expect(result.suggestions.length).toBeGreaterThan(0);
    for (const suggestion of result.suggestions) {
      expect(suggestion.title.length).toBeGreaterThan(0);
      expect(suggestion.explanation.length).toBeGreaterThan(0);
      expect(suggestion.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it('persists assessment recommendations for later use', async () => {
    const client = await registerAdult();
    await client.post('/api/assessments/emotional-wellness/responses', { answers: validAnswers });

    const { Recommendation, User } = await import('../src/models/index.js');
    const user = await User.findOne({ email: adultRegistration.email });
    expect(user).not.toBeNull();
    const recs = await Recommendation.find({ userId: user!._id, source: 'assessment' });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.status === 'suggested')).toBe(true);
    expect(recs.every((r) => r.description.length > 0)).toBe(true);
  });

  it('rejects incomplete answers with per-question details', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/assessments/emotional-wellness/responses', {
      answers: [{ questionId: 'mood-week', value: 3 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('assessment_validation');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(
      res.body.error.details.some((d: { questionId: string }) => d.questionId === 'help-focus'),
    ).toBe(true);
  });

  it('rejects out-of-range ratings', async () => {
    const client = await registerAdult();
    const res = await client.post('/api/assessments/emotional-wellness/responses', {
      answers: [
        { questionId: 'mood-week', value: 9 },
        { questionId: 'feeling-signals', optionIds: ['calm'] },
        { questionId: 'help-focus', optionIds: ['calm'] },
        { questionId: 'unwind-ways', optionIds: ['quiet'] },
        { questionId: 'preferred-mode', optionIds: ['reflection'] },
      ],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('assessment_validation');
  });

  it('records history and returns a detail view', async () => {
    const client = await registerAdult();
    const submit = await client.post('/api/assessments/emotional-wellness/responses', {
      answers: validAnswers,
    });
    const resultId = submit.body.data.result.id;

    const history = await client.get('/api/assessments/responses?page=1&limit=10');
    expect(history.status).toBe(200);
    expect(history.body.data.items).toHaveLength(1);
    expect(history.body.data.items[0].assessmentCode).toBe('emotional-wellness');
    expect(history.body.data.items[0].suggestionCount).toBeGreaterThan(0);
    expect(history.body.data).toHaveProperty('totalPages');

    const detail = await client.get(`/api/assessments/responses/${resultId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.result.id).toBe(resultId);
    expect(detail.body.data.result.sevenDayPlan).toHaveLength(7);
    expect(detail.body.data.user.email).toBe(adultRegistration.email);

    const missing = await client.get('/api/assessments/responses/000000000000000000000000');
    expect(missing.status).toBe(404);
  });

  it('hides teen+adult assessments from children', async () => {
    const child = new TestClient(app);
    await child.bootstrapCsrf();
    const register = await child.post('/api/auth/register', {
      email: 'child@example.com',
      password: 'Wellness!42',
      displayName: 'Cara Child',
      birthYear: new Date().getFullYear() - 9,
      guardianConsent: true,
      guardianName: 'Parent One',
      consents: { termsOfService: true, privacyPolicy: true, aiWellnessData: false },
    });
    expect(register.status).toBe(201);

    const list = await child.get('/api/assessments');
    expect(list.status).toBe(200);
    const codes = list.body.data.assessments.map((a: { code: string }) => a.code);
    expect(codes).toContain('emotional-wellness');
    expect(codes).not.toContain('focus-concentration');

    const blocked = await child.get('/api/assessments/focus-concentration');
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('age_restricted');

    const submit = await child.post('/api/assessments/focus-concentration/responses', {
      answers: [{ questionId: 'anything', value: 1 }],
    });
    expect(submit.status).toBe(403);
    expect(submit.body.error.code).toBe('age_restricted');
  });
});
