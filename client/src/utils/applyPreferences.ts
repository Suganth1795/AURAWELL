import type { UserPreferences } from '@/types';

/**
 * Applies the user's accessibility preferences to the document root so the
 * whole UI (including pages rendered before the app shell mounts) responds.
 */
export function applyPreferences(preferences: UserPreferences | null | undefined): void {
  const root = document.documentElement;
  if (!preferences) {
    root.removeAttribute('data-contrast');
    root.removeAttribute('data-theme');
    root.style.removeProperty('--app-font-scale');
    root.style.colorScheme = '';
    return;
  }

  if (preferences.contrast !== 'default') {
    root.setAttribute('data-contrast', preferences.contrast);
  } else {
    root.removeAttribute('data-contrast');
  }

  if (preferences.theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.removeAttribute('data-theme');
    root.style.colorScheme = '';
  }

  root.style.setProperty('--app-font-scale', String(preferences.fontScale));
}
