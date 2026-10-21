import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/spinner';
import { Popover } from '@/components/ui/popover';
import { useAsync } from '@/hooks/useAsync';
import { notificationService } from '@/features/notifications/notificationService';
import type { AppNotification } from '@/features/notifications/types';

export function NotificationsBell(): React.JSX.Element {
  const { data, error, loading, reload } = useAsync(() => notificationService.list(15), []);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const unread = data?.unreadCount ?? 0;

  async function markRead(id: string): Promise<void> {
    setActionError(null);
    try {
      await notificationService.markRead(id);
      reload();
    } catch {
      setActionError('Could not update that notification. Please try again.');
    }
  }

  async function markAll(): Promise<void> {
    setBusy(true);
    setActionError(null);
    try {
      await notificationService.markAllRead();
      reload();
    } catch {
      setActionError('Could not mark all as read. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string): Promise<void> {
    setActionError(null);
    try {
      await notificationService.remove(id);
      reload();
    } catch {
      setActionError('Could not delete that notification. Please try again.');
    }
  }

  return (
    <Popover
      title="Notifications"
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
          <span className="relative">
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </span>
        </Button>
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {unread > 0 ? `${unread} unread` : 'You are all caught up'}
        </span>
        {unread > 0 ? (
          <Button variant="ghost" size="sm" onClick={markAll} disabled={busy}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Mark all read
          </Button>
        ) : null}
      </div>

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {actionError ? <Alert variant="error">{actionError}</Alert> : null}
      {loading ? <LoadingState label="Loading…" /> : null}

      {data ? (
        data.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {data.items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onRead={() => markRead(item.id)}
                onRemove={() => remove(item.id)}
              />
            ))}
          </ul>
        )
      ) : null}
    </Popover>
  );
}

export function NotificationRow({
  item,
  onRead,
  onRemove,
}: {
  item: AppNotification;
  onRead: () => void;
  onRemove: () => void;
}): React.JSX.Element {
  return (
    <li className={item.read ? 'rounded-md p-2 text-sm' : 'rounded-md bg-primary/5 p-2 text-sm'}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">
            {item.title}
            {!item.read ? (
              <Badge variant="default" className="ml-2">
                New
              </Badge>
            ) : null}
          </p>
          {item.body ? <p className="text-xs text-muted-foreground">{item.body}</p> : null}
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {!item.read ? (
            <Button variant="ghost" size="icon" aria-label="Mark read" onClick={onRead}>
              <Check className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Delete notification" onClick={onRemove}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </li>
  );
}
