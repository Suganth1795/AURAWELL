import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

describe('authentication', () => {
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

  it('registers an adult user, starts a session and returns a profile', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();

    const res = await client.post('/api/auth/register', adultRegistration);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('adult@example.com');
    expect(res.body.data.user.ageGroup).toBe('adult');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    const me = await client.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.displayName).toBe('Ada Adult');
  });

  it('rejects duplicate registrations', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    await client.post('/api/auth/register', adultRegistration);
    const again = await client.post('/api/auth/register', adultRegistration);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('email_taken');
  });

  it('requires guardian consent for children', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.post('/api/auth/register', {
      ...adultRegistration,
      email: 'child@example.com',
      birthYear: new Date().getFullYear() - 9,
      guardianConsent: false,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('guardian_consent_required');
  });

  it('classifies teenagers by birth year', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.post('/api/auth/register', {
      ...adultRegistration,
      email: 'teen@example.com',
      birthYear: new Date().getFullYear() - 15,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.ageGroup).toBe('teen');
  });

  it('logs in and out, and rejects invalid credentials without leaking which field failed', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    await client.post('/api/auth/register', adultRegistration);

    const bad = await client.post('/api/auth/login', {
      email: adultRegistration.email,
      password: 'wrong-password',
    });
    expect(bad.status).toBe(401);
    expect(bad.body.error.message).toBe('Invalid email or password');

    const good = await client.post('/api/auth/login', {
      email: adultRegistration.email,
      password: adultRegistration.password,
    });
    expect(good.status).toBe(200);

    const logout = await client.post('/api/auth/logout');
    expect(logout.status).toBe(200);
    const me = await client.get('/api/auth/me');
    expect(me.status).toBe(401);
  });

  it('rejects state-changing requests without a CSRF token', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    await client.post('/api/auth/register', adultRegistration);

    const res = await request(app)
      .put('/api/users/preferences')
      .set('Cookie', `aurawell.sid=${client.getCookie('aurawell.sid')}`)
      .send({ theme: 'dark' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('csrf_invalid');
  });

  it('protects profile routes behind authentication', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  it('completes onboarding and stores goals', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    await client.post('/api/auth/register', adultRegistration);

    const res = await client.put('/api/users/onboarding', {
      displayName: 'Ada',
      interests: ['sleep', 'focus'],
      goals: ['Sleep more consistently'],
      preferredActivities: ['games', 'journal'],
      accessibility: { fontScale: 1.1 },
      notifications: { weeklySummary: false },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.onboardingCompleted).toBe(true);
    expect(res.body.data.user.preferences.fontScale).toBe(1.1);
    expect(res.body.data.user.preferences.notifications.weeklySummary).toBe(false);

    const goals = await client.get('/api/users/goals');
    expect(goals.status).toBe(200);
    expect(goals.body.data.goals).toHaveLength(1);
    expect(goals.body.data.goals[0].title).toBe('Sleep more consistently');
  });

  it('supports the password reset flow', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    await client.post('/api/auth/register', adultRegistration);

    const requested = await client.post('/api/auth/request-password-reset', {
      email: adultRegistration.email,
    });
    expect(requested.status).toBe(200);
    expect(requested.body.data.devToken).toBeTruthy();

    const reset = await client.post('/api/auth/reset-password', {
      token: requested.body.data.devToken,
      password: 'NewPass!2026',
    });
    expect(reset.status).toBe(200);

    const login = await client.post('/api/auth/login', {
      email: adultRegistration.email,
      password: 'NewPass!2026',
    });
    expect(login.status).toBe(200);
  });

  it('isolates data between users', async () => {
    const clientA = new TestClient(app);
    await clientA.bootstrapCsrf();
    await clientA.post('/api/auth/register', adultRegistration);
    await clientA.post('/api/users/goals', { title: 'Private goal of A' });

    const clientB = new TestClient(app);
    await clientB.bootstrapCsrf();
    await clientB.post('/api/auth/register', {
      ...adultRegistration,
      email: 'other@example.com',
    });

    const goalsB = await clientB.get('/api/users/goals');
    expect(goalsB.body.data.goals).toHaveLength(0);

    const goalA = await clientA.get('/api/users/goals');
    const goalId = goalA.body.data.goals[0].id;
    const patchB = await clientB.patch(`/api/users/goals/${goalId}`, { status: 'completed' });
    expect(patchB.status).toBe(404);
  });

  it('rejects malformed JSON bodies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_json');
  });

  it('validates registration input', async () => {
    const client = new TestClient(app);
    await client.bootstrapCsrf();
    const res = await client.post('/api/auth/register', { email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});
