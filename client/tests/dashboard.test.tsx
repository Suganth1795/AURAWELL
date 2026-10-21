import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WellnessGalaxy } from '@/features/analytics/WellnessGalaxy';
import { iconForKind, routeForKind } from '@/features/recommendations/recommendationService';

describe('WellnessGalaxy', () => {
  it('prompts for a check-in when there are no domains', () => {
    render(<WellnessGalaxy domains={[]} />);
    expect(screen.getByText(/complete a check-in/i)).toBeInTheDocument();
  });

  it('describes each domain for assistive technology', () => {
    render(
      <WellnessGalaxy
        domains={[
          { key: 'mood', label: 'Mood', value: 72 },
          { key: 'sleep_quality', label: 'Sleep quality', value: 45 },
        ]}
      />,
    );
    const image = screen.getByRole('img');
    expect(image.getAttribute('aria-label')).toContain('Mood: 72 out of 100');
    expect(image.getAttribute('aria-label')).toContain('Sleep quality: 45 out of 100');
    expect(screen.getByText(/Sleep quality/i)).toBeInTheDocument();
  });
});

describe('recommendation routing', () => {
  it('maps each kind to an in-app destination', () => {
    expect(routeForKind('game', 'memory-garden')).toBe('/games/memory-garden');
    expect(routeForKind('habit', 'x')).toBe('/habits');
    expect(routeForKind('journal_prompt', 'x')).toBe('/journal');
    expect(routeForKind('sleep_routine', 'x')).toBe('/sleep');
    expect(routeForKind('activity', 'x')).toBe('/activity');
    expect(routeForKind('breathing', 'x')).toBe('/counseling');
  });

  it('provides an icon for every recommendation kind', () => {
    for (const kind of [
      'game',
      'habit',
      'journal_prompt',
      'sleep_routine',
      'activity',
      'reflection',
      'breathing',
      'goal',
    ] as const) {
      expect(iconForKind(kind)).toBeTruthy();
    }
  });
});
