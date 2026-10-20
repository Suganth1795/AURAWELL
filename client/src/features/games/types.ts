export type GameMechanic =
  | 'sequence_recall'
  | 'find_targets'
  | 'emotion_match'
  | 'pattern_complete'
  | 'thought_reframe'
  | 'breathing'
  | 'story_choices'
  | 'habit_breakdown'
  | 'mixed_sprint'
  | 'word_build'
  | 'memory_match'
  | 'gratitude_collect';

export interface GameSummary {
  code: string;
  title: string;
  description: string;
  mechanic: GameMechanic;
  skill: string;
  estimatedMinutes: number;
  tags: string[];
  maxDifficulty: number;
  baseXp: number;
  maxXp: number;
  instructions: string;
  ageGroups: string[];
}

export interface GameDetail extends GameSummary {
  settings: Record<string, unknown>;
}

export interface GameSessionResult {
  gameCode: string;
  difficulty: number;
  score: number;
  maxScore: number;
  durationSeconds: number;
  completed: boolean;
  summary?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface GameSession {
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

export interface GameReward {
  awardedXp: number;
  xp: number;
  level: number;
  leveledUp: boolean;
  streakDays: number;
  longestStreak: number;
  streakExtended: boolean;
}

export interface LevelProgress {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export interface GameSubmitResponse {
  session: GameSession;
  reward: GameReward;
  progress: LevelProgress;
  duplicate: boolean;
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

export interface GameStatsResponse {
  stats: GameStats[];
  progress: LevelProgress;
  wellness: { xp: number; level: number; streakDays: number; longestStreak: number };
}

/** Outcome produced by an individual game component when a round finishes. */
export interface GameOutcome {
  score: number;
  maxScore: number;
  completed: boolean;
  summary?: Record<string, unknown>;
}

export interface GameComponentProps {
  game: GameDetail;
  difficulty: number;
  onFinish: (outcome: GameOutcome) => void;
  onExit: () => void;
}
