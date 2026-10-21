import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { cleanTestDb, closeTestDb, connectTestDb } from './helpers/db.js';
import { TestClient, adultRegistration } from './helpers/client.js';

let app: Express;

async function registerAdult(
  email = adultRegistration.email,
): Promise<{ client: TestClient; id: string }> {
  const client = new TestClient(app);
  await client.bootstrapCsrf();
  const res = await client.post('/api/auth/register', { ...adultRegistration, email });
  expect(res.status).toBe(201);
  return { client, id: res.body.data.user.id as string };
}

async function seedNotification(
  userId: string,
  input: { type: string; title: string; body?: string; readAt?: Date | null },
): Promise<string> {
  const { Notification } = await import('../src/models/index.js');
  const doc = await Notification.create({ userId, ...input });
  return doc.id;
}

describe('notifications API', () => {
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
    expect((await client.get('/api/notifications')).status).toBe(401);
  });

  it('lists notifications newest-first with an unread count', async () => {
    const { client, id } = await registerAdult();
    await seedNotification(id, { type: 'system', title: 'First' });
    await seedNotification(id, { type: 'achievement', title: 'Second' });
    const read = await seedNotification(id, { type: 'system', title: 'Third' });
    await client.post(`/api/notifications/${read}/read`);

    const res = await client.get('/api/notifications');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(3);
    expect(res.body.data.items[0].title).toBe('Third');
    expect(res.body.data.unreadCount).toBe(2);
  });

  it('filters to unread only', async () => {
    const { client, id } = await registerAdult();
    await seedNotification(id, { type: 'system', title: 'Unread' });
    const read = await seedNotification(id, { type: 'system', title: 'Read' });
    await client.post(`/api/notifications/${read}/read`);

    const res = await client.get('/api/notifications?unreadOnly=true');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe('Unread');
  });

  it('marks one and then all notifications read', async () => {
    const { client, id } = await registerAdult();
    const first = await seedNotification(id, { type: 'system', title: 'A' });
    await seedNotification(id, { type: 'system', title: 'B' });

    const one = await client.post(`/api/notifications/${first}/read`);
    expect(one.body.data.notification.read).toBe(true);

    const all = await client.post('/api/notifications/read-all');
    expect(all.body.data.updated).toBe(1);

    const res = await client.get('/api/notifications');
    expect(res.body.data.unreadCount).toBe(0);
  });

  it('deletes a notification and 404s unknown ids', async () => {
    const { client, id } = await registerAdult();
    const created = await seedNotification(id, { type: 'system', title: 'Bye' });
    expect((await client.delete(`/api/notifications/${created}`)).status).toBe(200);
    const list = await client.get('/api/notifications');
    expect(list.body.data.items).toHaveLength(0);

    const missing = await client.delete('/api/notifications/0123456789abcdef01234567');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('not_found');
  });

  it('does not expose another user notifications', async () => {
    const owner = await registerAdult('owner-n@example.com');
    await seedNotification(owner.id, { type: 'system', title: 'Secret' });

    const other = await registerAdult('other-n@example.com');
    const res = await other.client.get('/api/notifications');
    expect(res.body.data.items).toHaveLength(0);

    const forbidden = await other.client.post(
      `/api/notifications/${await seedNotification(owner.id, { type: 'system', title: 'X' })}/read`,
    );
    expect(forbidden.status).toBe(404);
  });

  it('honours notification preferences when creating', async () => {
    const { client, id } = await registerAdult();
    const { User } = await import('../src/models/index.js');
    const { createNotification } = await import('../src/services/notification.service.js');
    const user = await User.findById(id);
    if (!user) throw new Error('user missing');

    // habit reminders default on -> created
    expect(
      await createNotification(user, { type: 'habit_reminder', title: 'Stretch' }),
    ).not.toBeNull();

    await client.put('/api/users/preferences', {
      notifications: { habitReminders: false, weeklySummary: false, dailyCheckIn: true },
    });
    const updated = await User.findById(id);
    if (!updated) throw new Error('user missing');

    expect(
      await createNotification(updated, { type: 'habit_reminder', title: 'Stretch' }),
    ).toBeNull();
    expect(
      await createNotification(updated, { type: 'weekly_summary', title: 'Summary' }),
    ).toBeNull();
    // system and achievement are always delivered
    expect(await createNotification(updated, { type: 'system', title: 'Notice' })).not.toBeNull();
    expect(
      await createNotification(updated, { type: 'achievement', title: 'Nice' }),
    ).not.toBeNull();
  });

  it('treats unreadOnly=false as false rather than truthy', async () => {
    const { client, id } = await registerAdult();
    await seedNotification(id, { type: 'system', title: 'Unread' });
    const read = await seedNotification(id, { type: 'system', title: 'Read' });
    await client.post(`/api/notifications/${read}/read`);

    const res = await client.get('/api/notifications?unreadOnly=false');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(2);
  });
});
