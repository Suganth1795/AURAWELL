import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'habit_reminder',
  'weekly_summary',
  'achievement',
  'check_in',
  'system',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, maxlength: 400 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>>;

export const Notification = model('Notification', notificationSchema);
