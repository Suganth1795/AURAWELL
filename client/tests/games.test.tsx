import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameCard } from '@/features/games/GameCard';
import { GameIntro } from '@/features/games/GameIntro';
import { GameResultView } from '@/features/games/GameResultView';
import { CalmDragon } from '@/features/games/Games/CalmDragon';
import { MemoryLane } from '@/features/games/Games/MemoryLane';
import { ThoughtDetective } from '@/features/games/Games/ThoughtDetective';
import type {
  GameDetail,
  GameStats,
  GameSummary,
} from '@/features/games/types';

const summary: GameSummary = {
  code: 'memory-garden',
  title: 'Memory Garden',
  description: 'Watch a sequence bloom.',
  mechanic: 'sequence_recall',
  skill: 'memory',
  estimatedMinutes: 5,
  tags: ['memory'],
  maxDifficulty: 5,
  baseXp: 20,
  maxXp: 50,
  instructions: 'Watch then repeat.',
  ageGroups: ['adult'],
};

const detail: GameDetail = {
  ...summary,
  settings: { rounds: 5, sequenceStart: 3 },
};

describe('GameCard', () => {
  it('links to the game and shows XP ceiling', () => {
    render(
      <MemoryRouter>
        <GameCard game={summary} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /play/i })).toHaveAttribute(
      'href',
      '/games/memory-garden',
    );
    expect(screen.getByText(/up to 50 XP/i)).toBeInTheDocument();
  });

  it('shows a personal best when stats exist', () => {
    const stats: GameStats = {
      gameCode: 'memory-garden',
      title: 'Memory Garden',
      plays: 3,
      bestScore: 9,
      bestAccuracy: 0.9,
      lastPlayedAt: new Date().toISOString(),
      totalXp: 120,
    };
    render(
      <MemoryRouter>
        <GameCard game={summary} stats={stats} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/best: 90%/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /play again/i })).toBeInTheDocument();
  });
});

describe('GameIntro', () => {
  it('lets the player pick a difficulty and start', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const onDifficulty = vi.fn();
    render(
      <MemoryRouter>
        <GameIntro
          game={detail}
          difficulty={1}
          onDifficultyChange={onDifficulty}
          onStart={onStart}
          onBack={() => {}}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Watch then repeat.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Challenging' }));
    expect(onDifficulty).toHaveBeenCalledWith(5);
    await user.click(screen.getByRole('button', { name: /start playing/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe('GameResultView', () => {
  it('shows score, XP and level progress', () => {
    render(
      <MemoryRouter>
        <GameResultView
          gameTitle="Memory Garden"
          session={{
            id: '1',
            gameCode: 'memory-garden',
            difficulty: 1,
            score: 8,
            maxScore: 10,
            accuracy: 0.8,
            durationSeconds: 120,
            completed: true,
            xpAwarded: 22,
            playedAt: new Date().toISOString(),
          }}
          reward={{
            awardedXp: 22,
            xp: 22,
            level: 1,
            leveledUp: false,
            streakDays: 2,
            longestStreak: 2,
            streakExtended: true,
          }}
          progress={{ xp: 22, level: 1, xpIntoLevel: 22, xpForNextLevel: 100 }}
          duplicate={false}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('+22 XP')).toBeInTheDocument();
    expect(screen.getByText('2-day streak')).toBeInTheDocument();
  });
});

describe('CalmDragon', () => {
  it('starts the breathing guide when begun', async () => {
    const user = userEvent.setup();
    const breathing: GameDetail = {
      ...detail,
      code: 'calm-dragon',
      title: 'Calm the Dragon',
      mechanic: 'breathing',
      settings: { breathIn: 4, breathOut: 6, cycles: 2 },
    };
    render(
      <MemoryRouter>
        <CalmDragon game={breathing} difficulty={1} onFinish={() => {}} onExit={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/ready when you are/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByText('Breathe in…')).toBeInTheDocument();
  });
});

describe('ThoughtDetective', () => {
  it('scores a kinder reframe and can finish all rounds', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const game: GameDetail = {
      ...detail,
      code: 'thought-detective',
      title: 'Thought Detective',
      mechanic: 'thought_reframe',
      settings: { rounds: 1 },
    };
    render(
      <MemoryRouter>
        <ThoughtDetective game={game} difficulty={1} onFinish={onFinish} onExit={() => {}} />
      </MemoryRouter>,
    );
    const options = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-label') !== 'Leave this game');
    // Pick the first reframe option, then reveal results.
    await user.click(options[0]);
    await user.click(screen.getByRole('button', { name: /see my results/i }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].maxScore).toBe(1);
  });
});

describe('MemoryLane', () => {
  it('starts with all cards hidden', () => {
    const game: GameDetail = {
      ...detail,
      code: 'memory-lane',
      title: 'Memory Lane',
      mechanic: 'memory_match',
      settings: { pairsStart: 3, pairsMax: 6 },
    };
    render(
      <MemoryRouter>
        <MemoryLane game={game} difficulty={1} onFinish={() => {}} onExit={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/pairs 0\/3/i)).toBeInTheDocument();
  });
});
