import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MiniBarChart } from '@/features/wellness/MiniBarChart';
import { RewardNote } from '@/features/wellness/RewardNote';
import type { RewardSummary } from '@/features/wellness/types';

describe('MiniBarChart', () => {
  it('shows an empty message when all values are gaps', () => {
    render(
      <MiniBarChart
        ariaLabel="Chart"
        emptyLabel="Nothing here"
        data={[
          { label: '01', value: null },
          { label: '02', value: null },
        ]}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an accessible chart when values exist', () => {
    render(
      <MiniBarChart
        ariaLabel="Mood over time"
        data={[
          { label: '01', value: 0.5, caption: '01: 3' },
          { label: '02', value: null },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Mood over time' })).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});

describe('RewardNote', () => {
  const base: RewardSummary = {
    xpAwarded: 5,
    xp: 25,
    level: 1,
    leveledUp: false,
    streakDays: 3,
    longestStreak: 3,
    streakExtended: true,
  };

  it('shows XP and streak when XP is awarded', () => {
    render(<RewardNote reward={base} />);
    expect(screen.getByText('+5 XP')).toBeInTheDocument();
    expect(screen.getByText('3-day streak')).toBeInTheDocument();
  });

  it('acknowledges an already-logged day without XP', () => {
    render(<RewardNote reward={{ ...base, xpAwarded: 0 }} />);
    expect(screen.queryByText('+5 XP')).not.toBeInTheDocument();
    expect(screen.getByText(/already logged today/i)).toBeInTheDocument();
  });

  it('announces a level-up', () => {
    render(<RewardNote reward={{ ...base, leveledUp: true, level: 2 }} />);
    expect(screen.getByText(/reached level 2/i)).toBeInTheDocument();
  });
});
