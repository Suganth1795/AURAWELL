import { GameSession, Recommendation, type UserDoc } from '../models/index.js';
import { getGame, type GameDefinition } from '../data/games.js';
import { awardXp, applyStreak, levelProgress, type LevelProgress } from './progress.service.js';

export class GameValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'GameValidationError';
  }
}

export interface GameResultInput {
  gameCode: string;
  difficulty: number;
  score: number;
  maxScore: number;
  durationSeconds: number;
  completed: boolean;
  summary?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface GameReward {
  awardedXp: number;
  xp: number;
  level: number;
  leveledUp: boolean;
  streakDays: number;
  longestStreak: number;
  streakExtended: boolean;
  streakFreezeUsed: false;
}

export interface GameSessionDto {
  id: string;
  gameCode: string;
  difficulty: number;
  score: number;
  maxScore: number;
  accuracy: number;
  durationSeconds: number;
  completed: boolean;
  xpAwarded: number;
  playedAt: string;
}

export interface GameOutcome {
  session: GameSessionDto;
  reward: GameReward;
  progress: LevelProgress;
  /** Set when the same idempotency key was submitted before; no XP is re-granted. */
  duplicate: boolean;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/** Scores XP from real performance, bounded by the game's cap. Never trusted from the client. */
function computeXp(
  game: GameDefinition,
  input: GameResultInput,
): { xp: number; accuracy: number } {
  const maxScore = Math.max(1, Math.round(input.maxScore));
  const score = clamp(Math.round(input.score), 0, maxScore);
  const accuracy = score / maxScore;

  // Difficulty scales the ceiling: higher difficulty earns more, but is bounded.
  const difficultyFactor = 0.6 + 0.1 * (clamp(input.difficulty, 1, game.maxDifficulty) - 1);
  const completionFactor = input.completed ? 1 : 0.4;

  // Time-on-task contributes a small, capped bonus so speed cannot be farmed.
  const minutes = clamp(input.durationSeconds / 60, 0, game.estimatedMinutes * 2);
  const timeBonus = Math.min(8, Math.round(minutes));

  const raw = game.baseXp * accuracy * difficultyFactor * completionFactor + timeBonus * completionFactor;
  const xp = Math.round(clamp(raw, 0, game.maxXp));
  return { xp, accuracy };
}

function toSessionDto(session: {
  id: string;
  gameCode: string;
  difficulty: number;
  score: number;
  maxScore: number;
  durationSeconds: number;
  completed: boolean;
  xpAwarded: number;
  playedAt: Date;
}): GameSessionDto {
  const maxScore = Math.max(1, session.maxScore);
  return {
    id: session.id,
    gameCode: session.gameCode,
    difficulty: session.difficulty,
    score: session.score,
    maxScore: session.maxScore,
    accuracy: Math.round((session.score / maxScore) * 100) / 100,
    durationSeconds: session.durationSeconds,
    completed: session.completed,
    xpAwarded: session.xpAwarded,
    playedAt: session.playedAt.toISOString(),
  };
}

/**
 * Records a play session, awards XP/streak, and marks matching game
 * recommendations as completed. Idempotent per idempotencyKey.
 */
export async function recordGameResult(user: UserDoc, input: GameResultInput): Promise<GameOutcome> {
  const game = getGame(input.gameCode);
  if (!game) throw new GameValidationError('Unknown game', 'unknown_game');
  if (!game.ageGroups.includes(user.ageGroup)) {
    throw new GameValidationError('This game is not available for your age group', 'age_restricted');
  }
  if (input.maxScore < 0 || input.score < 0) {
    throw new GameValidationError('Score values must be positive', 'invalid_score');
  }
  if (input.durationSeconds < 0 || input.durationSeconds > 7200) {
    throw new GameValidationError('Duration is out of range', 'invalid_duration');
  }

  // Idempotency: return the original outcome instead of granting XP twice.
  if (input.idempotencyKey) {
    const existing = await GameSession.findOne({
      userId: user.id,
      idempotencyKey: input.idempotencyKey,
    });
    if (existing) {
      const streak = applyStreak(user);
      return {
        session: toSessionDto(existing),
        reward: {
          awardedXp: 0,
          xp: user.wellness.xp,
          level: user.wellness.level,
          leveledUp: false,
          streakDays: streak.streakDays,
          longestStreak: streak.longestStreak,
          streakExtended: false,
          streakFreezeUsed: false,
        },
        progress: levelProgress(user.wellness.xp),
        duplicate: true,
      };
    }
  }

  const { xp, accuracy } = computeXp(game, input);
  const maxScore = Math.max(0, Math.round(input.maxScore));

  const session = await GameSession.create({
    userId: user.id,
    gameCode: game.code,
    difficulty: clamp(Math.round(input.difficulty), 1, game.maxDifficulty),
    score: clamp(Math.round(input.score), 0, Math.max(1, maxScore)),
    maxScore,
    durationSeconds: clamp(Math.round(input.durationSeconds), 0, 7200),
    completed: Boolean(input.completed),
    summary: { ...(input.summary ?? {}), accuracy },
    xpAwarded: xp,
    rewarded: xp > 0,
    // Omit the field entirely when absent so the sparse unique index is skipped.
    ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
    playedAt: new Date(),
  });

  const streak = applyStreak(user);
  const xpResult = awardXp(user, xp);

  // Completing the matching game clears any outstanding game recommendation.
  await Recommendation.updateMany(
    { userId: user.id, kind: 'game', code: game.code, status: { $in: ['suggested', 'accepted'] } },
    { $set: { status: 'completed', completedAt: new Date() } },
  );

  await user.save();

  return {
    session: toSessionDto(session),
    reward: {
      awardedXp: xpResult.awarded,
      xp: xpResult.xp,
      level: xpResult.level,
      leveledUp: xpResult.leveledUp,
      streakDays: streak.streakDays,
      longestStreak: streak.longestStreak,
      streakExtended: streak.extended,
      streakFreezeUsed: false,
    },
    progress: levelProgress(xpResult.xp),
    duplicate: false,
  };
}

export async function listGameSessions(
  user: UserDoc,
  options: { skip: number; limit: number },
): Promise<{ items: GameSessionDto[]; total: number }> {
  const [sessions, total] = await Promise.all([
    GameSession.find({ userId: user.id })
      .sort({ playedAt: -1 })
      .skip(options.skip)
      .limit(options.limit),
    GameSession.countDocuments({ userId: user.id }),
  ]);
  return { items: sessions.map(toSessionDto), total };
}

export interface GameStats {
  gameCode: string;
  title: string;
  plays: number;
  bestScore: number;
  bestAccuracy: number;
  lastPlayedAt: string | null;
  totalXp: number;
}

/** Aggregates a user's personal bests per game, without exposing comparisons. */
export async function getGameStats(user: UserDoc): Promise<GameStats[]> {
  const rows = await GameSession.aggregate<{
    _id: string;
    plays: number;
    bestScore: number;
    bestAccuracy: number;
    lastPlayedAt: Date;
    totalXp: number;
  }>([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: '$gameCode',
        plays: { $sum: 1 },
        bestScore: { $max: '$score' },
        bestAccuracy: {
          $max: { $cond: [{ $gt: ['$maxScore', 0] }, { $divide: ['$score', '$maxScore'] }, 0] },
        },
        lastPlayedAt: { $max: '$playedAt' },
        totalXp: { $sum: '$xpAwarded' },
      },
    },
    { $sort: { lastPlayedAt: -1 } },
  ]);

  return rows.map((row) => {
    const game = getGame(row._id);
    return {
      gameCode: row._id,
      title: game?.title ?? row._id,
      plays: row.plays,
      bestScore: row.bestScore,
      bestAccuracy: Math.round(row.bestAccuracy * 100) / 100,
      lastPlayedAt: row.lastPlayedAt ? new Date(row.lastPlayedAt).toISOString() : null,
      totalXp: row.totalXp,
    };
  });
}
