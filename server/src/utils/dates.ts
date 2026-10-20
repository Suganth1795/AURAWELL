/** Calendar day key (YYYY-MM-DD) in UTC. Used for streaks and daily rollups. */
export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function dayKeyAdd(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date);
}

export function lastNDays(n: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfUtcDay(b).getTime() - startOfUtcDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Computes sleep duration in minutes across a midnight boundary.
 * Returns null when the interval is invalid or implausibly long (> 24h).
 */
export function sleepDurationMinutes(start: Date, end: Date): number | null {
  const diff = end.getTime() - start.getTime();
  if (diff <= 0 || diff > 24 * 60 * 60 * 1000) return null;
  return Math.round(diff / 60_000);
}
