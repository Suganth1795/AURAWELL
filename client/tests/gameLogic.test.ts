import { describe, expect, it } from 'vitest';
import { clamp, difficultyFactor, optionList, sample, shuffle } from '@/features/games/gameLogic';

describe('gameLogic', () => {
  it('clamps values into range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-3, 1, 10)).toBe(1);
    expect(clamp(99, 1, 10)).toBe(10);
  });

  it('shuffles without losing items', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([...input].sort());
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('samples the requested number of unique items', () => {
    const result = sample([1, 2, 3, 4, 5], 3);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    expect(sample([1, 2], 5)).toHaveLength(2);
  });

  it('scales difficulty monotonically', () => {
    expect(difficultyFactor(1)).toBeLessThan(difficultyFactor(5));
    expect(difficultyFactor(1)).toBeCloseTo(1, 5);
  });

  it('builds an option list that always contains the target', () => {
    const options = optionList(['a', 'b', 'c', 'd'], 'a', 2);
    expect(options).toHaveLength(3);
    expect(options).toContain('a');
  });
});
