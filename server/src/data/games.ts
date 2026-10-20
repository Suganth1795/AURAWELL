import type { AgeGroup } from '../utils/ageGroup.js';
import { WELLNESS_CONTENT, type WellnessContentItem } from './wellnessContent.js';

/**
 * Mechanic identifiers implemented by the MindPlay client engine. Each code maps
 * to a real playable component; the server only describes the contract.
 */
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

export interface GameDefinition {
  code: string;
  title: string;
  description: string;
  mechanic: GameMechanic;
  skill: string;
  ageGroups: AgeGroup[];
  estimatedMinutes: number;
  tags: string[];
  maxDifficulty: number;
  /** Baseline XP for a completed round at difficulty 1; scales with performance. */
  baseXp: number;
  /** Cap on XP for a single round, protecting against runaway client values. */
  maxXp: number;
  /** Accessible instructions shown before play, in plain language. */
  instructions: string;
  /** Structured settings the client engine reads (rounds, timers, breath cycles, etc.). */
  settings: Record<string, unknown>;
}

const MECHANIC_BY_CODE: Record<string, { mechanic: GameMechanic; baseXp: number; maxXp: number }> = {
  'memory-garden': { mechanic: 'sequence_recall', baseXp: 20, maxXp: 50 },
  'focus-quest': { mechanic: 'find_targets', baseXp: 18, maxXp: 45 },
  'emotion-detective': { mechanic: 'emotion_match', baseXp: 18, maxXp: 45 },
  'pattern-planet': { mechanic: 'pattern_complete', baseXp: 18, maxXp: 45 },
  'thought-detective': { mechanic: 'thought_reframe', baseXp: 22, maxXp: 50 },
  'calm-dragon': { mechanic: 'breathing', baseXp: 15, maxXp: 35 },
  'story-choices': { mechanic: 'story_choices', baseXp: 18, maxXp: 40 },
  'habit-architect': { mechanic: 'habit_breakdown', baseXp: 22, maxXp: 50 },
  'cognitive-sprint': { mechanic: 'mixed_sprint', baseXp: 24, maxXp: 55 },
  'word-garden': { mechanic: 'word_build', baseXp: 20, maxXp: 45 },
  'memory-lane': { mechanic: 'memory_match', baseXp: 18, maxXp: 45 },
  'gratitude-quest': { mechanic: 'gratitude_collect', baseXp: 20, maxXp: 45 },
};

const SETTINGS_BY_CODE: Record<string, Record<string, unknown>> = {
  'memory-garden': { rounds: 5, sequenceStart: 3, sequenceMax: 8 },
  'focus-quest': { rounds: 5, targetStart: 3, distractorStart: 4, secondsPerRound: 30 },
  'emotion-detective': { rounds: 5, options: 3 },
  'pattern-planet': { rounds: 6 },
  'thought-detective': { rounds: 4 },
  'calm-dragon': { breathIn: 4, breathOut: 6, cycles: 6 },
  'story-choices': { pathLength: 3 },
  'habit-architect': { minSteps: 3, maxSteps: 6 },
  'cognitive-sprint': { rounds: 6, secondsPerRound: 25 },
  'word-garden': { rounds: 5, minWordLength: 3, maxWordLength: 6 },
  'memory-lane': { pairsStart: 3, pairsMax: 6, rounds: 3 },
  'gratitude-quest': { rounds: 5, itemsPerRound: 3 },
};

const INSTRUCTIONS_BY_CODE: Record<string, string> = {
  'memory-garden':
    'A sequence of flowers lights up one at a time. Watch carefully, then tap them back in the same order.',
  'focus-quest': 'Look at the garden and tap only the objects named at the top before the time runs out.',
  'emotion-detective':
    'Read a short situation and choose the feeling it might describe. There is no wrong feeling to have.',
  'pattern-planet': 'Look at the shapes and colours, work out the pattern, then choose what comes next.',
  'thought-detective':
    'Read a tricky thought and pick a kinder, more balanced way to look at the same situation.',
  'calm-dragon':
    'Follow the dragon: breathe in as it grows, and breathe out slowly as it shrinks. Take your time.',
  'story-choices': 'Read the story and choose what happens next. Explore and see how your choices unfold.',
  'habit-architect':
    'Turn one small habit you want into tiny, easy steps. Drag-free: just add, reorder and confirm.',
  'cognitive-sprint':
    'A friendly mix of quick matching and recall rounds. Answer at your own pace; accuracy matters more than speed.',
  'word-garden': 'Find the hidden word using the letter clues. Tap letters to build it, then submit.',
  'memory-lane': 'Flip the cards and find matching pairs of familiar everyday pictures.',
  'gratitude-quest': 'Look at each scene and tap the good things you could be thankful for.',
};

function buildDefinition(item: WellnessContentItem): GameDefinition | null {
  const meta = MECHANIC_BY_CODE[item.code];
  if (!meta) return null;
  const skill = typeof item.details.skill === 'string' ? item.details.skill : 'wellbeing';
  return {
    code: item.code,
    title: item.title,
    description: item.description,
    mechanic: meta.mechanic,
    skill,
    ageGroups: item.ageGroups,
    estimatedMinutes: item.estimatedMinutes,
    tags: item.tags,
    maxDifficulty: 5,
    baseXp: meta.baseXp,
    maxXp: meta.maxXp,
    instructions: INSTRUCTIONS_BY_CODE[item.code] ?? item.description,
    settings: { ...(item.details ?? {}), ...(SETTINGS_BY_CODE[item.code] ?? {}) },
  };
}

export const GAME_DEFINITIONS: GameDefinition[] = WELLNESS_CONTENT.filter(
  (item) => item.kind === 'game',
)
  .map(buildDefinition)
  .filter((g): g is GameDefinition => g !== null);

const gamesByCode = new Map(GAME_DEFINITIONS.map((g) => [g.code, g]));

export function getGame(code: string): GameDefinition | undefined {
  return gamesByCode.get(code);
}

export function gamesForAge(ageGroup: AgeGroup): GameDefinition[] {
  return GAME_DEFINITIONS.filter((g) => g.ageGroups.includes(ageGroup));
}
