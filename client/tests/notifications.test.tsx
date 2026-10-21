import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationRow } from '@/features/notifications/NotificationsBell';
import type { AppNotification } from '@/features/notifications/types';

const base: AppNotification = {
  id: 'n1',
  type: 'system',
  title: 'Welcome to AuraWell',
  body: 'Take a moment to breathe.',
  read: false,
  createdAt: new Date().toISOString(),
  readAt: null,
};

describe('NotificationRow', () => {
  it('marks unread notifications and offers both actions', async () => {
    const onRead = vi.fn();
    const onRemove = vi.fn();
    render(<NotificationRow item={base} onRead={onRead} onRemove={onRemove} />);

    expect(screen.getByText('Welcome to AuraWell')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mark read' }));
    expect(onRead).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Delete notification' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('hides the mark-read action for read notifications', () => {
    render(
      <NotificationRow
        item={{ ...base, read: true, readAt: new Date().toISOString() }}
        onRead={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.queryByText('New')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark read' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete notification' })).toBeInTheDocument();
  });
});
