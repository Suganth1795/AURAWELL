import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'aurawell-theme';

/** Reads the persisted mode, defaulting to "dark" on first visit for the cosmic experience. */
function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'dark';
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return prefersDark() ? 'dark' : 'light';
}

/**
 * Writes the resolved theme to the document root. Kept dependency-free so the
 * inline no-flash script in index.html can perform the identical logic before
 * React mounts.
 */
export function applyThemeToDocument(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
}

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Re-resolve "system" after an OS-level change. */
  syncSystem: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: readStoredMode(),
  resolved: resolveTheme(readStoredMode()),
  setMode: (mode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
    const resolved = resolveTheme(mode);
    applyThemeToDocument(resolved);
    set({ mode, resolved });
  },
  syncSystem: () => {
    if (get().mode !== 'system') return;
    const resolved = resolveTheme('system');
    applyThemeToDocument(resolved);
    set({ resolved });
  },
}));

/**
 * Subscribes to OS colour-scheme changes so a "system" preference stays live.
 * Returns an unsubscribe function.
 */
export function watchSystemTheme(): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => useThemeStore.getState().syncSystem();
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}
