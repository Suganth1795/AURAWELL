/** Deterministic helpers shared by MindPlay games. No network, no AI. */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.max(0, Math.min(count, items.length)));
}

/** Rounds difficulty (1..5) into a small multiplier used to scale game parameters. */
export function difficultyFactor(difficulty: number, step = 0.25): number {
  return 1 + clamp(difficulty, 1, 5) * step - step;
}

export function optionList<T>(items: readonly T[], target: T, distractors: number): T[] {
  const others = items.filter((i) => i !== target);
  return shuffle([target, ...sample(others, distractors)]);
}
