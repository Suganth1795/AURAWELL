import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { ok } from '../utils/http.js';
import { paginate, paginationQuerySchema, skipFor } from '../utils/pagination.js';
import { getGame, gamesForAge } from '../data/games.js';
import {
  GameValidationError,
  getGameStats,
  listGameSessions,
  recordGameResult,
  type GameResultInput,
} from '../services/gameProgress.service.js';
import { levelProgress } from '../services/progress.service.js';
import { toUserPublicDto } from '../models/index.js';

function toGameSummary(gameCode: string) {
  const game = getGame(gameCode);
  if (!game) return null;
  return {
    code: game.code,
    title: game.title,
    description: game.description,
    mechanic: game.mechanic,
    skill: game.skill,
    estimatedMinutes: game.estimatedMinutes,
    tags: game.tags,
    maxDifficulty: game.maxDifficulty,
    baseXp: game.baseXp,
    maxXp: game.maxXp,
    instructions: game.instructions,
    ageGroups: game.ageGroups,
  };
}

export const listGamesHandler: RequestHandler = (req, res, next) => {
  try {
    const user = requireUser(req);
    const games = gamesForAge(user.ageGroup).map((g) => toGameSummary(g.code)!);
    ok(res, { games });
  } catch (error) {
    next(error);
  }
};

export const getGameHandler: RequestHandler = (req, res, next) => {
  try {
    const user = requireUser(req);
    const game = getGame(String(req.params.code));
    if (!game) throw new HttpError(404, 'Game not found', 'not_found');
    if (!game.ageGroups.includes(user.ageGroup)) {
      throw new HttpError(403, 'This game is not available for your age group', 'age_restricted');
    }
    ok(res, {
      game: {
        ...toGameSummary(game.code),
        settings: game.settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitGameResultHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const input = req.body as GameResultInput;
    try {
      const outcome = await recordGameResult(user, input);
      const status = outcome.duplicate ? 200 : 201;
      ok(
        res,
        {
          session: outcome.session,
          reward: outcome.reward,
          progress: outcome.progress,
          duplicate: outcome.duplicate,
          user: toUserPublicDto(user),
        },
        status,
      );
    } catch (error) {
      if (error instanceof GameValidationError) {
        throw new HttpError(400, error.message, error.code);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const listGameSessionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const query = paginationQuerySchema.parse(req.query);
    const { items, total } = await listGameSessions(user, {
      skip: skipFor(query),
      limit: query.limit,
    });
    ok(res, paginate(items, total, query));
  } catch (error) {
    next(error);
  }
};

export const gameStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const stats = await getGameStats(user);
    ok(res, {
      stats,
      progress: levelProgress(user.wellness.xp),
      wellness: {
        xp: user.wellness.xp,
        level: user.wellness.level,
        streakDays: user.wellness.streakDays,
        longestStreak: user.wellness.longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};
