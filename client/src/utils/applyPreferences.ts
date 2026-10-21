import type { UserPreferences } from '@/types';
import { useThemeStore } from '@/stores/theme';

/**
 * Applies the user's accessibility preferences to the document root so the
 * whole UI (including pages rendered before the app shell mounts) responds.
 *
 * Theme is delegated to the persistent theme store (localStorage + OS default)
 * so the choice survives refreshes and cookie-less visits; the account value is
 * used to seed the store when the user has not chosen on this device.
 */
export function applyPreferences(preferences: UserPreferences | null | undefined): void {
  const root = document.documentElement;

  if (preferences) {
    if (preferences.contrast !== 'default') {
      root.setAttribute('data-contrast', preferences.contrast);
    } else {
      root.removeAttribute('data-contrast');
    }

    if (preferences.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }

    root.style.setProperty('--app-font-scale', String(preferences.fontScale));

    // Reconcile the account theme into the store unless the device already has
    // an explicit choice, which should win.
    const { mode, setMode } = useThemeStore.getState();
    const hasLocal = typeof window !== 'undefined' && !!window.localStorage.getItem('aurawell-theme');
    if (!hasLocal && preferences.theme !== mode) {
      setMode(preferences.theme);
    }
    return;
  }

  root.removeAttribute('data-contrast');
  root.removeAttribute('data-reduce-motion');
  root.style.removeProperty('--app-font-scale');
}
