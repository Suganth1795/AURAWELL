import { Notification, type UserDoc } from '../models/index.js';
import type { NotificationType } from '../models/Notification.js';
import { HttpError } from '../middleware/error.js';

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

function toDto(doc: {
  _id: unknown;
  type: string;
  title: string;
  body?: string | null;
  readAt?: Date | null;
  createdAt: Date;
}): NotificationDto {
  return {
    id: String(doc._id),
    type: doc.type,
    title: doc.title,
    body: doc.body ?? null,
    read: Boolean(doc.readAt),
    createdAt: doc.createdAt.toISOString(),
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
  };
}

/** Maps a notification type to the user preference that can suppress it. */
function preferenceAllows(user: UserDoc, type: NotificationType): boolean {
  switch (type) {
    case 'habit_reminder':
      return user.preferences.notifications.habitReminders;
    case 'weekly_summary':
      return user.preferences.notifications.weeklySummary;
    case 'check_in':
      return user.preferences.notifications.dailyCheckIn;
    case 'achievement':
    case 'system':
      return true;
    default:
      return true;
  }
}

/**
 * Creates an in-app notification unless the user has turned the matching
 * preference off. System and achievement notices are always delivered.
 */
export async function createNotification(
  user: UserDoc,
  input: { type: NotificationType; title: string; body?: string },
): Promise<NotificationDto | null> {
  if (!preferenceAllows(user, input.type)) return null;
  const doc = await Notification.create({
    userId: user._id,
    type: input.type,
    title: input.title,
    body: input.body,
  });
  return toDto(doc);
}

export async function listNotifications(
  user: UserDoc,
  options: { limit: number; unreadOnly?: boolean },
): Promise<{ items: NotificationDto[]; unreadCount: number }> {
  const filter: Record<string, unknown> = { userId: user._id };
  if (options.unreadOnly) filter.readAt = null;

  const [docs, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(options.limit),
    Notification.countDocuments({ userId: user._id, readAt: null }),
  ]);

  return { items: docs.map(toDto), unreadCount };
}

export async function markNotificationRead(user: UserDoc, id: string): Promise<NotificationDto> {
  const doc = await Notification.findOneAndUpdate(
    { _id: id, userId: user._id },
    { $set: { readAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!doc) throw new HttpError(404, 'Notification not found', 'not_found');
  return toDto(doc);
}

export async function markAllNotificationsRead(user: UserDoc): Promise<{ updated: number }> {
  const result = await Notification.updateMany(
    { userId: user._id, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return { updated: result.modifiedCount };
}

export async function deleteNotification(user: UserDoc, id: string): Promise<void> {
  const result = await Notification.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount === 0) throw new HttpError(404, 'Notification not found', 'not_found');
}
