export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationsResult {
  items: AppNotification[];
  unreadCount: number;
}
