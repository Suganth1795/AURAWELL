import type { ComponentType } from 'react';
import type { GameComponentProps, GameMechanic } from './types';
import { MemoryGarden } from './Games/MemoryGarden';
import { FocusQuest } from './Games/FocusQuest';
import { EmotionDetective } from './Games/EmotionDetective';
import { PatternPlanet } from './Games/PatternPlanet';
import { ThoughtDetective } from './Games/ThoughtDetective';
import { CalmDragon } from './Games/CalmDragon';
import { StoryChoices } from './Games/StoryChoices';
import { HabitArchitect } from './Games/HabitArchitect';
import { CognitiveSprint } from './Games/CognitiveSprint';
import { WordGarden } from './Games/WordGarden';
import { MemoryLane } from './Games/MemoryLane';
import { GratitudeQuest } from './Games/GratitudeQuest';

export const GAME_COMPONENTS: Record<GameMechanic, ComponentType<GameComponentProps>> = {
  sequence_recall: MemoryGarden,
  find_targets: FocusQuest,
  emotion_match: EmotionDetective,
  pattern_complete: PatternPlanet,
  thought_reframe: ThoughtDetective,
  breathing: CalmDragon,
  story_choices: StoryChoices,
  habit_breakdown: HabitArchitect,
  mixed_sprint: CognitiveSprint,
  word_build: WordGarden,
  memory_match: MemoryLane,
  gratitude_collect: GratitudeQuest,
};

export function gameComponentFor(mechanic: GameMechanic): ComponentType<GameComponentProps> {
  return GAME_COMPONENTS[mechanic];
}
