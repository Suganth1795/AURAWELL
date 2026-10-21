import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore, watchSystemTheme, type ThemeMode } from '@/stores/theme';
import { cn } from '@/utils/cn';

/**
 * Global light/dark toggle. Driven by the persistent theme store so the choice
 * survives refreshes; when a user is signed in it also writes the preference to
 * their account so it follows them across devices.
 */
export function ThemeToggle(): React.JSX.Element {
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);
  const setMode = useThemeStore((s) => s.setMode);
  const user = useAuthStore((s) => s.user);

  useEffect(() => watchSystemTheme(), []);

  // Keep the persisted local theme in sync once we know the account preference
  // (only when the user has never chosen a theme on this device).
  useEffect(() => {
    if (!user) return;
    const hasLocal = window.localStorage.getItem('aurawell-theme');
    if (!hasLocal && user.preferences.theme !== 'system') {
      setMode(user.preferences.theme);
    }
  }, [user, setMode]);

  function choose(next: ThemeMode) {
    setMode(next);
    if (user) {
      void api
        .put('/users/preferences', { theme: next })
        .catch(() => {
          /* preference sync is best-effort; the local theme already applied */
        });
    }
  }

  const label = `Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`;

  return (
    <button
      type="button"
      onClick={() => choose(resolved === 'dark' ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border',
        'bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
      )}
      aria-label={label}
      aria-pressed={resolved === 'dark'}
      title={`${label}${mode === 'system' ? ' (following system)' : ''}`}
    >
      <Sun
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          resolved === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          resolved === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
        aria-hidden="true"
      />
    </button>
  );
}
