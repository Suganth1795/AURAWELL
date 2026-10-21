import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { applyPreferences } from '@/utils/applyPreferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PageHeader } from '@/components/layout/PageHeader';

import { Alert } from '@/components/ui/alert';
import { Tabs } from '@/components/ui/tabs';
import type { User, UserPreferences } from '@/types';

const AVATAR_EMOJI = ['🌱', '🌊', '🌙', '☀️', '🦋', '🦉', '🐢', '🌸'];

export function SettingsPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [tab, setTab] = useState('accessibility');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(() => user?.displayName ?? '');

  if (!user) return <div />;
  const prefs = user.preferences;

  async function persist(body: Record<string, unknown>): Promise<void> {
    setError(null);
    setSaved(false);
    try {
      const result = await api.put<{ user: User }>('/users/preferences', body);
      setUser(result.user);
      applyPreferences(result.user.preferences);
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save preferences');
    }
  }

  const accessibilityTab = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="theme">Theme</Label>
        <Select
          id="theme"
          value={prefs.theme}
          onChange={(e) => {
            const theme = e.target.value as UserPreferences['theme'];
            void persist({ theme });
          }}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contrast">Contrast</Label>
        <Select
          id="contrast"
          value={prefs.contrast}
          onChange={(e) => {
            const contrast = e.target.value as UserPreferences['contrast'];
            void persist({ contrast });
          }}
        >
          <option value="default">Default</option>
          <option value="high">High contrast</option>
          <option value="dark">Dark contrast</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="font-scale">Text size</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            Aa
          </span>
          <Slider
            label="Text size"
            min={0.85}
            max={1.5}
            step={0.05}
            value={prefs.fontScale}
            onValueChange={(fontScale) => {
              document.documentElement.style.setProperty('--app-font-scale', String(fontScale));
            }}
            onCommittedChange={(fontScale) => void persist({ fontScale })}
            className="max-w-xs"
          />
          <span className="text-sm tabular-nums">{prefs.fontScale.toFixed(2)}×</span>
        </div>
      </div>
      <Checkbox
        label="Reduce motion"
        checked={prefs.reduceMotion}
        onChange={(e) => void persist({ reduceMotion: e.target.checked })}
      />
      <Checkbox
        label="Prefer audio instructions"
        checked={prefs.audioInstructions}
        onChange={(e) => void persist({ audioInstructions: e.target.checked })}
      />
    </div>
  );

  const notificationsTab = (
    <div className="space-y-4">
      <Checkbox
        label="Daily mood check-in reminder"
        checked={prefs.notifications.dailyCheckIn}
        onChange={(e) =>
          void persist({
            notifications: { ...prefs.notifications, dailyCheckIn: e.target.checked },
          })
        }
      />
      <Checkbox
        label="Weekly wellness summary"
        checked={prefs.notifications.weeklySummary}
        onChange={(e) =>
          void persist({
            notifications: { ...prefs.notifications, weeklySummary: e.target.checked },
          })
        }
      />
      <Checkbox
        label="Habit reminders"
        checked={prefs.notifications.habitReminders}
        onChange={(e) =>
          void persist({
            notifications: { ...prefs.notifications, habitReminders: e.target.checked },
          })
        }
      />
    </div>
  );

  const privacyTab = (
    <div className="space-y-4">
      <Checkbox
        label="Allow AI wellness features to use my assessment and check-in summaries"
        description="Journal contents are never included unless you enable journal AI separately."
        checked={prefs.aiWellnessDataConsent}
        onChange={(e) => void persist({ aiWellnessDataConsent: e.target.checked })}
      />
      <Checkbox
        label="Allow AURA to reference my private journal entries"
        description="Off by default. You can turn this off at any time."
        checked={prefs.journalAiConsent}
        onChange={(e) => void persist({ journalAiConsent: e.target.checked })}
      />
      <p className="text-xs text-muted-foreground">
        Manage consent records, export your data or delete your account from the Privacy page.
      </p>
      <Button variant="outline" onClick={() => navigate('/privacy')}>
        Open privacy centre
      </Button>
    </div>
  );

  const profileTab = (
    <ProfileSection
      displayName={displayName}
      setDisplayName={setDisplayName}
      avatar={user.wellness.avatar}
      onSaved={(u) => setUser(u)}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={`Signed in as ${user.email} · ${user.ageGroup.replace('_', ' ')}`}
      />

      {saved ? (
        <Alert variant="success" role="status">
          Settings saved.
        </Alert>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'profile', label: 'Profile', content: profileTab },
          { value: 'accessibility', label: 'Accessibility', content: accessibilityTab },
          { value: 'notifications', label: 'Notifications', content: notificationsTab },
          { value: 'privacy', label: 'AI & privacy', content: privacyTab },
          { value: 'account', label: 'Password', content: <ChangePasswordSection /> },
        ]}
      />
    </div>
  );
}

function ProfileSection({
  displayName,
  setDisplayName,
  avatar,
  onSaved,
}: {
  displayName: string;
  setDisplayName: (v: string) => void;
  avatar: { emoji: string; color: string };
  onSaved: (user: User) => void;
}): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ variant: 'success' | 'error'; text: string } | null>(
    null,
  );

  async function saveName() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await api.patch<{ user: User }>('/users/profile', {
        displayName: displayName.trim(),
      });
      onSaved(result.user);
      setMessage({ variant: 'success', text: 'Display name saved.' });
    } catch (e) {
      setMessage({
        variant: 'error',
        text: e instanceof ApiError ? e.message : 'Could not save name',
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveEmoji(emoji: string) {
    const result = await api.put<{ user: User }>('/users/preferences', {
      avatar: { ...avatar, emoji },
    });
    onSaved(result.user);
  }

  return (
    <div className="space-y-4">
      {message ? (
        <Alert variant={message.variant} role="status">
          {message.text}
        </Alert>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <div className="flex gap-2">
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
          />
          <Button onClick={() => void saveName()} disabled={busy || displayName.trim().length < 2}>
            Save
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Avatar</Label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Choose avatar ${emoji}`}
              aria-pressed={avatar.emoji === emoji}
              className={`rounded-lg border p-2 text-xl transition-colors ${
                avatar.emoji === emoji ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onClick={() => void saveEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection(): React.JSX.Element {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState<{ variant: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage(null);
    try {
      await api.put('/auth/password', { currentPassword: current, newPassword: next });
      setMessage({ variant: 'success', text: 'Password changed.' });
      setCurrent('');
      setNext('');
    } catch (e) {
      setMessage({ variant: 'error', text: e instanceof ApiError ? e.message : 'Change failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="next-password">New password</Label>
        <Input
          id="next-password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <Button onClick={() => void submit()} disabled={busy || !current || next.length < 8}>
        {busy ? 'Updating…' : 'Change password'}
      </Button>
    </div>
  );
}
