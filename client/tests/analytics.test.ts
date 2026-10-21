import { describe, expect, it } from 'vitest';
import { shortLabel, toBars } from '@/pages/AnalyticsPage';
import { formatConsentType } from '@/pages/PrivacyPage';

describe('analytics helpers', () => {
  it('formats day keys for compact labels', () => {
    expect(shortLabel('2026-03-05')).toBe('5/3');
  });

  it('normalises trend values against a fixed peak and keeps gaps', () => {
    const bars = toBars(
      [
        { dayKey: '2026-03-01', value: 5 },
        { dayKey: '2026-03-02', value: null },
        { dayKey: '2026-03-03', value: 2.5 },
      ],
      5,
    );
    expect(bars[0].value).toBe(1);
    expect(bars[1].value).toBeNull();
    expect(bars[2].value).toBeCloseTo(0.5);
  });

  it('scales to the observed peak when no max is provided', () => {
    const bars = toBars(
      [
        { dayKey: '2026-03-01', value: 10 },
        { dayKey: '2026-03-02', value: 20 },
      ],
      null,
    );
    expect(bars[0].value).toBeCloseTo(0.5);
    expect(bars[1].value).toBe(1);
  });

  it('never exceeds a normalised height of 1', () => {
    const bars = toBars([{ dayKey: '2026-03-01', value: 999 }], 5);
    expect(bars[0].value).toBe(1);
  });
});

describe('privacy helpers', () => {
  it('humanises consent type identifiers', () => {
    expect(formatConsentType('ai_wellness_data')).toBe('AI wellness data');
    expect(formatConsentType('terms_of_service')).toBe('Terms of service');
    expect(formatConsentType('some_unknown_type')).toBe('Some Unknown Type');
  });
});
