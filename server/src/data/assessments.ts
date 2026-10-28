import type { AgeGroup } from '../utils/ageGroup.js';
import type { BankCategory } from './questionBank/types.js';
import { BANK_ASSESSMENT_SEEDS } from './questionBank/seeds.js';

export interface SeedOption {
  id: string;
  label: string;
  emoji?: string;
  tags: string[];
  weight?: number;
}

export interface SeedQuestion {
  id: string;
  text: string;
  helpText?: string;
  responseType: 'single_choice' | 'multi_choice' | 'rating' | 'boolean' | 'short_text';
  required?: boolean;
  maxSelections?: number;
  /** Value substituted when an unanswered optional question is omitted. */
  default?: string | number | string[] | boolean;
  ratingMin?: number;
  ratingMax?: number;
  ratingLabels?: string[];
  maxLength?: number;
  options?: SeedOption[];
  ageVariants?: Partial<Record<Exclude<AgeGroup, 'adult'>, { text?: string; helpText?: string; options?: SeedOption[] }>>;
  conditional?: { dependsOnQuestionId: string; showWhenOptionIds: string[] };
  ratingRules?: { min?: number; max?: number; tags: string[]; weight?: number }[];
}

export interface SeedInterpretationRule {
  id: string;
  label: string;
  allTags?: string[];
  anyTags?: string[];
  minWeight?: number;
  priority: number;
  summary: string;
  priorities: string[];
  recommend: {
    games?: string[];
    habits?: string[];
    journalPrompts?: string[];
    activities?: string[];
    reflections?: string[];
    soundscapes?: string[];
  };
  planTemplate?: { days: { day: number; focus: string; actions: string[] }[] };
}

export interface AssessmentSeed {
  code: string;
  version: string;
  title: string;
  description: string;
  category:
    | 'emotional'
    | 'sleep'
    | 'focus'
    | 'habits'
    | 'activity'
    | 'social'
    | 'digital'
    | 'strengths'
    | 'lifestyle'
    | 'reflection'
    | BankCategory;
  ageGroups: AgeGroup[];
  estimatedMinutes: number;
  status: 'published';
  intro: string;
  outro: string;
  questions: SeedQuestion[];
  interpretationRules: SeedInterpretationRule[];
}

const LEGACY_ASSESSMENT_SEEDS: AssessmentSeed[] = [
  {
    code: 'emotional-wellness',
    version: '1.0.0',
    title: 'Emotional wellness check-in',
    description: 'A short reflection on how you have been feeling lately.',
    category: 'emotional',
    ageGroups: ['child', 'teen', 'adult', 'older_adult'],
    estimatedMinutes: 4,
    status: 'published',
    intro: 'These are project-developed wellness reflection questions, not a diagnostic test. Answer honestly — there are no wrong answers.',
    outro: 'Thank you for reflecting. Your results suggest some practical ideas you can try.',
    questions: [
      {
        id: 'mood-week',
        text: 'Overall, how have you been feeling over the past week?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Very low', 'Low', 'Okay', 'Good', 'Great'],
        ratingRules: [
          { max: 2, tags: ['emotions:low'], weight: 3 },
          { min: 3, max: 3, tags: ['emotions:mixed'], weight: 1 },
          { min: 4, tags: ['emotions:positive'], weight: 0 },
        ],
        ageVariants: {
          child: { text: 'How have your feelings been this week?' },
          teen: { text: 'Looking back over the past week, how have you felt overall?' },
          older_adult: { text: 'Thinking about the past week, how have your spirits been?' },
        },
      },
      {
        id: 'feeling-signals',
        text: 'Which of these have you noticed recently?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 5,
        options: [
          { id: 'calm', label: 'Feeling calm or content', tags: ['emotions:positive'], weight: 0 },
          { id: 'worried', label: 'Worry or nervousness', tags: ['calm:stressed'], weight: 2 },
          { id: 'sad', label: 'Sadness or low mood', tags: ['emotions:low'], weight: 2 },
          { id: 'irritable', label: 'Irritability or frustration', tags: ['calm:stressed'], weight: 2 },
          { id: 'numb', label: 'Feeling flat or numb', tags: ['emotions:low'], weight: 2 },
          { id: 'joy', label: 'Moments of joy', tags: ['emotions:positive'], weight: 0 },
        ],
        ageVariants: {
          child: {
            text: 'Which of these have you noticed in yourself?',
            options: [
              { id: 'calm', label: 'I feel mostly happy or calm', tags: ['emotions:positive'], weight: 0 },
              { id: 'worried', label: 'I feel worried or nervous', tags: ['calm:stressed'], weight: 2 },
              { id: 'sad', label: 'I feel sad or down', tags: ['emotions:low'], weight: 2 },
              { id: 'irritable', label: 'I feel grumpy or annoyed', tags: ['calm:stressed'], weight: 2 },
              { id: 'joy', label: 'I have fun moments', tags: ['emotions:positive'], weight: 0 },
            ],
          },
        },
      },
      {
        id: 'help-focus',
        text: 'What would you most like help with today?',
        responseType: 'single_choice',
        options: [
          { id: 'calm', label: 'Feeling calmer', tags: ['needs:calm'], weight: 1 },
          { id: 'mood', label: 'Lifting my mood', tags: ['needs:mood'], weight: 1 },
          { id: 'sleep', label: 'Sleeping better', tags: ['needs:sleep'], weight: 1 },
          { id: 'focus', label: 'Focusing better', tags: ['needs:focus'], weight: 1 },
          { id: 'connection', label: 'Feeling connected', tags: ['needs:connection'], weight: 1 },
        ],
        ageVariants: {
          child: { text: 'What would you like help with today?' },
        },
      },
      {
        id: 'unwind-ways',
        text: 'Which activities help you unwind?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 6,
        options: [
          { id: 'move', label: 'Moving or sport', tags: ['coping:movement'] },
          { id: 'creative', label: 'Drawing, music or making things', tags: ['coping:creative'] },
          { id: 'people', label: 'Time with people', tags: ['coping:social'] },
          { id: 'quiet', label: 'Quiet time alone', tags: ['coping:quiet'] },
          { id: 'screens', label: 'Screens or gaming', tags: ['coping:screens'] },
          { id: 'none', label: 'I am not sure yet', tags: ['coping:unsure'], weight: 2 },
        ],
      },
      {
        id: 'preferred-mode',
        text: 'Would you prefer reflection, a game, or a conversation right now?',
        helpText: 'This shapes what we suggest first.',
        responseType: 'single_choice',
        options: [
          { id: 'reflection', label: 'Reflection or journaling', tags: ['mode:reflection'] },
          { id: 'game', label: 'A game', tags: ['mode:game'] },
          { id: 'conversation', label: 'A guided conversation', tags: ['mode:conversation'] },
        ],
        ageVariants: {
          child: { text: 'What sounds best right now: a story, a game, or a quiet activity?' },
        },
      },
    ],
    interpretationRules: [
      {
        id: 'low-mood-support',
        label: 'Low mood signals',
        allTags: ['emotions:low'],
        priority: 10,
        summary:
          'You reported some low feelings this week. Small, gentle actions — like naming feelings, noticing good moments and connecting with someone you trust — can help you care for yourself while things ease.',
        priorities: ['Lifting my mood', 'Feeling connected'],
        recommend: {
          games: ['gratitude-quest', 'emotion-detective'],
          journalPrompts: ['jp-kind-self', 'jp-gratitude'],
          activities: ['act-name-emotions', 'act-connect-someone'],
          habits: ['habit-journal-check'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Notice', actions: ['Name one feeling today', 'Try Calm the Dragon for 3 minutes'] },
            { day: 2, focus: 'Gratitude', actions: ['Write three good things', 'Play Gratitude Quest'] },
            { day: 3, focus: 'Connect', actions: ['Message someone you trust', 'Notice how you feel after'] },
            { day: 4, focus: 'Move', actions: ['Take a 15-minute walk', 'Note your mood before and after'] },
            { day: 5, focus: 'Reflect', actions: ['Journal two lines before bed'] },
            { day: 6, focus: 'Enjoy', actions: ['Do one activity you used to enjoy'] },
            { day: 7, focus: 'Review', actions: ['Complete the weekly reflection', 'Pick one idea to keep'] },
          ],
        },
      },
      {
        id: 'stress-signals',
        label: 'Stress signals',
        anyTags: ['calm:stressed'],
        minWeight: 2,
        priority: 20,
        summary:
          'Stress or irritability showed up in your answers. A quick breathing practice and a clearer wind-down routine are practical first steps.',
        priorities: ['Feeling calmer'],
        recommend: {
          games: ['calm-dragon', 'thought-detective'],
          habits: ['habit-breathing-break'],
          journalPrompts: ['jp-unwind'],
          activities: ['act-name-emotions'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Breathe', actions: ['One minute of slow breathing', 'Notice the toughest moment of the day'] },
            { day: 2, focus: 'Spot triggers', actions: ['Write down one stress trigger'] },
            { day: 3, focus: 'Prepare', actions: ['Plan one response for that trigger'] },
            { day: 4, focus: 'Unwind', actions: ['Try the wind-down routine 30 minutes before bed'] },
            { day: 5, focus: 'Move', actions: ['Do 10 minutes of gentle movement'] },
            { day: 6, focus: 'Reframe', actions: ['Play Thought Detective once'] },
            { day: 7, focus: 'Review', actions: ['Note which tool helped most'] },
          ],
        },
      },
      {
        id: 'positive-balance',
        label: 'Positive balance',
        allTags: ['emotions:positive'],
        priority: 50,
        summary:
          'Your answers suggest a mostly positive balance right now. Keep noticing what works and protect the routines that support you.',
        priorities: ['Keeping my routines'],
        recommend: {
          games: ['gratitude-quest'],
          journalPrompts: ['jp-gratitude'],
          activities: ['act-gratitude-round'],
        },
      },
    ],
  },
  {
    code: 'sleep-habits',
    version: '1.0.0',
    title: 'Sleep habits',
    description: 'Reflect on your sleep routine and how rested you feel.',
    category: 'sleep',
    ageGroups: ['child', 'teen', 'adult', 'older_adult'],
    estimatedMinutes: 4,
    status: 'published',
    intro: 'Sleep routines affect how we feel. Answer based on a typical recent week.',
    outro: 'Here are ideas that may help you sleep more consistently.',
    questions: [
      {
        id: 'sleep-hours',
        text: 'On a typical night, about how many hours do you sleep?',
        responseType: 'single_choice',
        options: [
          { id: 'under5', label: 'Less than 5 hours', tags: ['sleep:short'], weight: 3 },
          { id: '5to6', label: '5–6 hours', tags: ['sleep:short'], weight: 2 },
          { id: '6to7', label: '6–7 hours', tags: ['sleep:marginal'], weight: 1 },
          { id: '7to9', label: '7–9 hours', tags: ['sleep:good'], weight: 0 },
          { id: 'over9', label: 'More than 9 hours', tags: ['sleep:long'], weight: 1 },
        ],
        ageVariants: {
          child: {
            text: 'About how long do you sleep each night?',
            options: [
              { id: 'under8', label: 'Less than 8 hours', tags: ['sleep:short'], weight: 2 },
              { id: '8to10', label: 'About 8–10 hours', tags: ['sleep:good'], weight: 0 },
              { id: 'over10', label: 'More than 10 hours', tags: ['sleep:long'], weight: 1 },
            ],
          },
        },
      },
      {
        id: 'schedule-consistency',
        text: 'How consistent is your bed and wake time?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Very irregular', 'Irregular', 'Somewhat', 'Mostly consistent', 'Very consistent'],
        ratingRules: [
          { max: 2, tags: ['sleep:inconsistent'], weight: 3 },
          { min: 3, max: 3, tags: ['sleep:marginal'], weight: 1 },
          { min: 4, tags: ['sleep:consistent'], weight: 0 },
        ],
        ageVariants: {
          child: { text: 'Do you go to bed and wake up around the same times?' },
        },
      },
      {
        id: 'rested',
        text: 'How rested do you feel after waking?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Not rested', 'Rarely', 'Sometimes', 'Often', 'Very rested'],
        ratingRules: [
          { max: 2, tags: ['sleep:unrested'], weight: 3 },
          { min: 3, max: 3, tags: ['sleep:marginal'], weight: 1 },
          { min: 4, tags: ['sleep:rested'], weight: 0 },
        ],
      },
      {
        id: 'wind-down',
        text: 'What does your last hour before bed usually look like?',
        responseType: 'single_choice',
        options: [
          { id: 'screens', label: 'Screens in bed', tags: ['sleep:screens'], weight: 2 },
          { id: 'relax', label: 'Reading or quiet activity', tags: ['sleep:routine'], weight: 0 },
          { id: 'busy', label: 'Work, study or chores', tags: ['sleep:busy'], weight: 1 },
          { id: 'varies', label: 'It varies a lot', tags: ['sleep:inconsistent'], weight: 1 },
        ],
      },
      {
        id: 'improve-goal',
        text: 'Which sleep habit would you like to improve?',
        responseType: 'single_choice',
        options: [
          { id: 'window', label: 'A consistent bedtime', tags: ['goal:sleep_window'] },
          { id: 'routine', label: 'A calmer wind-down', tags: ['goal:sleep_routine'] },
          { id: 'screens', label: 'Less screen time at night', tags: ['goal:sleep_screens'] },
          { id: 'hours', label: 'Getting more hours', tags: ['goal:sleep_hours'] },
        ],
        ageVariants: {
          child: { text: 'What sleep habit would you like to work on?' },
        },
      },
    ],
    interpretationRules: [
      {
        id: 'inconsistent-schedule',
        label: 'Irregular schedule',
        allTags: ['sleep:inconsistent'],
        priority: 10,
        summary:
          'Your sleep timing seems irregular. A consistent bedtime window and a short wind-down routine are the highest-impact changes you can try.',
        priorities: ['Consistent bedtime', 'Calmer wind-down'],
        recommend: {
          habits: ['habit-sleep-window', 'habit-screen-curfew'],
          activities: ['act-bedtime-routine'],
          games: ['calm-dragon'],
          journalPrompts: ['jp-unwind'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Pick a bedtime', actions: ['Choose a target bedtime', 'Set a reminder 30 minutes before'] },
            { day: 2, focus: 'Wind down', actions: ['Dim screens 30 minutes before bed'] },
            { day: 3, focus: 'Routine', actions: ['Follow the wind-down routine steps'] },
            { day: 4, focus: 'Morning anchor', actions: ['Get a few minutes of daylight after waking'] },
            { day: 5, focus: 'Adjust', actions: ['Keep the same bedtime, note what helps'] },
            { day: 6, focus: 'Protect', actions: ['No screens in bed'] },
            { day: 7, focus: 'Review', actions: ['Compare how rested you feel vs. last week'] },
          ],
        },
      },
      {
        id: 'short-sleep',
        label: 'Short sleep',
        allTags: ['sleep:short'],
        priority: 15,
        summary:
          'You are getting fewer hours than most people need. Protecting an earlier wind-down can help you reclaim lost minutes each night.',
        priorities: ['Getting more hours'],
        recommend: {
          habits: ['habit-sleep-window', 'habit-screen-curfew'],
          activities: ['act-bedtime-routine'],
        },
      },
      {
        id: 'unrested',
        label: 'Not feeling rested',
        allTags: ['sleep:unrested'],
        priority: 20,
        summary:
          'You are not waking feeling rested. Along with a steadier schedule, note anything that affects your nights (caffeine, late exercise, worry) and discuss persistent problems with a healthcare professional.',
        priorities: ['Feeling rested'],
        recommend: {
          journalPrompts: ['jp-unwind'],
          activities: ['act-bedtime-routine', 'act-gentle-mobility'],
          habits: ['habit-breathing-break'],
        },
      },
      {
        id: 'sleep-ok',
        label: 'Sleep looks steady',
        allTags: ['sleep:good', 'sleep:consistent'],
        priority: 60,
        summary: 'Your sleep habits look fairly steady. Keep protecting the routines that work.',
        priorities: ['Keeping my routine'],
        recommend: { journalPrompts: ['jp-gratitude'] },
      },
    ],
  },
  {
    code: 'focus-concentration',
    version: '1.0.0',
    title: 'Focus and concentration',
    description: 'Understand your focus patterns and what supports concentration.',
    category: 'focus',
    ageGroups: ['teen', 'adult'],
    estimatedMinutes: 4,
    status: 'published',
    intro: 'Everyone focuses differently. This check-in maps your focus style.',
    outro: 'Here are focus practices that match your answers.',
    questions: [
      {
        id: 'distractions',
        text: 'What distracts you most often?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 5,
        options: [
          { id: 'phone', label: 'Phone notifications', tags: ['focus:distracted'], weight: 2 },
          { id: 'noise', label: 'Noise around me', tags: ['focus:distracted'], weight: 1 },
          { id: 'thoughts', label: 'My own thoughts', tags: ['focus:distracted'], weight: 2 },
          { id: 'tired', label: 'Feeling tired', tags: ['focus:distracted'], weight: 2 },
          { id: 'nothing', label: 'Not much distracts me', tags: ['focus:steady'], weight: 0 },
        ],
      },
      {
        id: 'easiest-time',
        text: 'When do you find concentration easiest?',
        responseType: 'single_choice',
        options: [
          { id: 'morning', label: 'Morning', tags: ['focus:morning'] },
          { id: 'afternoon', label: 'Afternoon', tags: ['focus:afternoon'] },
          { id: 'evening', label: 'Evening', tags: ['focus:evening'] },
          { id: 'varies', label: 'It varies', tags: ['focus:varies'] },
        ],
      },
      {
        id: 'session-style',
        text: 'Do you prefer short or long work sessions?',
        responseType: 'single_choice',
        options: [
          { id: 'short', label: 'Short sessions (15–25 min)', tags: ['focus:short_sessions'] },
          { id: 'medium', label: 'Medium sessions (30–45 min)', tags: ['focus:medium_sessions'] },
          { id: 'long', label: 'Long sessions (60+ min)', tags: ['focus:long_sessions'] },
        ],
      },
      {
        id: 'week-target',
        text: 'What would you like to accomplish this week?',
        helpText: 'Optional — a short note.',
        responseType: 'short_text',
        required: false,
        default: '',
        maxLength: 200,
        options: [],
      },
      {
        id: 'focus-confidence',
        text: 'How confident are you that you can protect time for focused work this week?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Not confident', 'Slightly', 'Somewhat', 'Confident', 'Very confident'],
        ratingRules: [
          { max: 2, tags: ['focus:low_confidence'], weight: 2 },
          { min: 3, max: 3, tags: ['focus:medium_confidence'], weight: 1 },
          { min: 4, tags: ['focus:confident'], weight: 0 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'high-distraction',
        label: 'High distraction load',
        allTags: ['focus:distracted'],
        minWeight: 2,
        priority: 10,
        summary:
          'Several distractions are competing for your attention. Structured focus sprints and one small environment change (notifications off) can help you reclaim concentration.',
        priorities: ['Focusing better'],
        recommend: {
          activities: ['act-focus-sprint-plan'],
          habits: ['habit-study-sprints', 'habit-screen-curfew'],
          games: ['focus-quest', 'cognitive-sprint'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Observe', actions: ['Note when you lose focus most'] },
            { day: 2, focus: 'Design', actions: ['Run one 25-minute focus sprint with notifications off'] },
            { day: 3, focus: 'Repeat', actions: ['Two focus sprints with a real break between'] },
            { day: 4, focus: 'Train', actions: ['Play Focus Quest once'] },
            { day: 5, focus: 'Adjust', actions: ['Change one distraction you noticed'] },
            { day: 6, focus: 'Apply', actions: ['Use a sprint on a real task you have been avoiding'] },
            { day: 7, focus: 'Review', actions: ['Note what worked best'] },
          ],
        },
      },
      {
        id: 'low-focus-confidence',
        label: 'Low focus confidence',
        allTags: ['focus:low_confidence'],
        priority: 25,
        summary:
          'You are not confident you can protect focus time yet. Start smaller than you think you need — two honest sprints beat one ambitious plan.',
        priorities: ['Focusing better', 'Building routines'],
        recommend: {
          activities: ['act-focus-sprint-plan'],
          habits: ['habit-study-sprints'],
          journalPrompts: ['jp-tomorrow-aim'],
        },
      },
      {
        id: 'steady-focus',
        label: 'Steady focus',
        allTags: ['focus:steady'],
        priority: 60,
        summary: 'Your focus setup looks fairly steady. Keep using your best time of day deliberately.',
        priorities: ['Protecting my best hours'],
        recommend: { games: ['cognitive-sprint'], journalPrompts: ['jp-energy-map'] },
      },
    ],
  },
  {
    code: 'habit-readiness',
    version: '1.0.0',
    title: 'Habit readiness',
    description: 'Find out how ready you are to build a new habit and what would help.',
    category: 'habits',
    ageGroups: ['teen', 'adult', 'older_adult'],
    estimatedMinutes: 4,
    status: 'published',
    intro: 'Building habits is a skill. This check-in finds a habit that fits your real life.',
    outro: 'You will get a habit suggestion split into small steps.',
    questions: [
      {
        id: 'habit-choice',
        text: 'Which habit would you like to develop?',
        responseType: 'single_choice',
        options: [
          { id: 'sleep', label: 'A consistent bedtime', tags: ['habit:sleep'] },
          { id: 'move', label: 'Daily movement', tags: ['habit:movement'] },
          { id: 'mindful', label: 'A daily calm or mindfulness moment', tags: ['habit:mindful'] },
          { id: 'focus', label: 'Focused study or work time', tags: ['habit:focus'] },
          { id: 'journal', label: 'Journaling', tags: ['habit:journal'] },
          { id: 'social', label: 'More connection with people', tags: ['habit:social'] },
        ],
        ageVariants: {
          child: { text: 'Which of these would you like to try?' },
        },
      },
      {
        id: 'barriers',
        text: 'What usually makes it difficult?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 5,
        options: [
          { id: 'time', label: 'Not enough time', tags: ['barrier:time'], weight: 2 },
          { id: 'forget', label: 'Forgetting', tags: ['barrier:forget'], weight: 2 },
          { id: 'energy', label: 'Low energy', tags: ['barrier:energy'], weight: 2 },
          { id: 'motivation', label: 'Motivation fades', tags: ['barrier:motivation'], weight: 2 },
          { id: 'unclear', label: 'Not sure where to start', tags: ['barrier:unclear'], weight: 2 },
          { id: 'few', label: 'Not many barriers', tags: ['barrier:few'], weight: 0 },
        ],
      },
      {
        id: 'time-budget',
        text: 'How much time can you realistically dedicate?',
        responseType: 'single_choice',
        options: [
          { id: 'five', label: 'About 5 minutes a day', tags: ['budget:tiny'] },
          { id: 'fifteen', label: 'About 15 minutes a day', tags: ['budget:small'] },
          { id: 'thirty', label: 'About 30 minutes a day', tags: ['budget:medium'] },
          { id: 'more', label: 'More than 30 minutes', tags: ['budget:large'] },
        ],
      },
      {
        id: 'support-tools',
        text: 'Would reminders or visual progress help you?',
        responseType: 'single_choice',
        options: [
          { id: 'reminders', label: 'Reminders would help', tags: ['support:reminders'] },
          { id: 'progress', label: 'Visual progress would help', tags: ['support:progress'] },
          { id: 'both', label: 'Both would help', tags: ['support:reminders', 'support:progress'] },
          { id: 'neither', label: 'Neither, I prefer it simple', tags: ['support:none'] },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'barrier-time',
        label: 'Time barrier',
        allTags: ['barrier:time'],
        priority: 15,
        summary:
          'Time is your main barrier, so the best habit for you is a tiny one that fits in minutes, not a bigger plan that keeps slipping.',
        priorities: ['A habit that fits my day'],
        recommend: {
          habits: ['habit-breathing-break', 'habit-journal-check'],
          games: ['habit-architect'],
          activities: ['act-gratitude-round'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Shrink it', actions: ['Pick a 2-minute version of your habit'] },
            { day: 2, focus: 'Anchor it', actions: ['Attach it to something you already do daily'] },
            { day: 3, focus: 'Track it', actions: ['Mark it done on the habits page'] },
            { day: 4, focus: 'Protect it', actions: ['Do it at your easiest time of day'] },
            { day: 5, focus: 'Adjust', actions: ['Make it 20% smaller if it felt hard'] },
            { day: 6, focus: 'Repeat', actions: ['Keep the streak gentle — no punishment for misses'] },
            { day: 7, focus: 'Review', actions: ['Note what made it easier'] },
          ],
        },
      },
      {
        id: 'barrier-forget',
        label: 'Forgetting barrier',
        allTags: ['barrier:forget'],
        priority: 20,
        summary: 'You mostly forget rather than fail. A reminder tied to an existing routine will do most of the work.',
        priorities: ['Remembering my habit'],
        recommend: {
          habits: ['habit-breathing-break'],
          games: ['habit-architect'],
        },
      },
      {
        id: 'ready-to-build',
        label: 'Ready to build',
        allTags: ['barrier:few', 'budget:medium'],
        priority: 50,
        summary: 'You seem ready and well-resourced. Pick one habit, start small and let consistency do the lifting.',
        priorities: ['Building my habit'],
        recommend: {
          games: ['habit-architect'],
          journalPrompts: ['jp-tomorrow-aim'],
          reflections: ['ref-win-log'],
        },
      },
    ],
  },
  {
    code: 'activity-preferences',
    version: '1.0.0',
    title: 'Physical activity preferences',
    description: 'Find movement that suits your life and mood.',
    category: 'activity',
    ageGroups: ['teen', 'adult', 'older_adult'],
    estimatedMinutes: 3,
    status: 'published',
    intro: 'Movement here means any activity that suits you — not a fitness test.',
    outro: 'Here are movement ideas matched to your answers.',
    questions: [
      {
        id: 'current-movement',
        text: 'How much movement do you get in a typical week now?',
        responseType: 'single_choice',
        options: [
          { id: 'little', label: 'Very little', tags: ['movement:low'], weight: 2 },
          { id: 'some', label: 'Some walking or light activity', tags: ['movement:moderate'], weight: 1 },
          { id: 'regular', label: 'Regular structured activity', tags: ['movement:active'], weight: 0 },
          { id: 'lots', label: 'Very active most days', tags: ['movement:active'], weight: 0 },
        ],
      },
      {
        id: 'enjoyed-movement',
        text: 'Which movement do you actually enjoy?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 5,
        options: [
          { id: 'walk', label: 'Walking', tags: ['pref:walk'] },
          { id: 'cycle', label: 'Cycling', tags: ['pref:cycle'] },
          { id: 'yoga', label: 'Yoga or stretching', tags: ['pref:yoga'] },
          { id: 'sport', label: 'Sport or games', tags: ['pref:sport'] },
          { id: 'dance', label: 'Dancing or music movement', tags: ['pref:dance'] },
          { id: 'none', label: 'Nothing yet', tags: ['pref:unsure'], weight: 1 },
        ],
      },
      {
        id: 'movement-mood',
        text: 'How does movement usually affect your mood?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Worse', 'No change', 'Neutral', 'Better', 'Much better'],
        ratingRules: [
          { max: 2, tags: ['movement:mood_down'], weight: 2 },
          { min: 3, max: 3, tags: ['movement:mood_neutral'], weight: 1 },
          { min: 4, tags: ['movement:mood_up'], weight: 0 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'low-movement',
        label: 'Low current movement',
        allTags: ['movement:low'],
        priority: 15,
        summary:
          'You are moving very little right now. The best start is a short, enjoyable movement you would not mind repeating tomorrow.',
        priorities: ['Moving more days'],
        recommend: {
          habits: ['habit-daily-walk'],
          activities: ['act-gentle-mobility'],
          games: ['focus-quest'],
        },
      },
      {
        id: 'enjoyed-something',
        label: 'Enjoyed movement found',
        anyTags: ['pref:walk', 'pref:cycle', 'pref:yoga', 'pref:sport', 'pref:dance'],
        priority: 40,
        summary: 'You already know movement you enjoy — that is the strongest predictor of sticking with it.',
        priorities: ['Doing what I enjoy'],
        recommend: { habits: ['habit-daily-walk'], activities: ['act-gentle-mobility'] },
      },
    ],
  },
  {
    code: 'social-connection',
    version: '1.0.0',
    title: 'Social connection',
    description: 'Reflect on the people around you and how connected you feel.',
    category: 'social',
    ageGroups: ['teen', 'adult', 'older_adult'],
    estimatedMinutes: 3,
    status: 'published',
    intro: 'Connection is a basic human need. Answer based on how the last few weeks felt.',
    outro: 'Here are gentle ways to strengthen connection.',
    questions: [
      {
        id: 'connected-level',
        text: 'How connected do you feel to people around you?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Very alone', 'Alone', 'Somewhat', 'Connected', 'Very connected'],
        ratingRules: [
          { max: 2, tags: ['social:isolated'], weight: 3 },
          { min: 3, max: 3, tags: ['social:somewhat'], weight: 1 },
          { min: 4, tags: ['social:connected'], weight: 0 },
        ],
        ageVariants: {
          child: { text: 'Do you feel you have friends or family you can talk to?' },
        },
      },
      {
        id: 'social-energy',
        text: 'What is your social energy like lately?',
        responseType: 'single_choice',
        options: [
          { id: 'drained', label: 'People tire me out right now', tags: ['social:drained'], weight: 2 },
          { id: 'balanced', label: 'It feels balanced', tags: ['social:balanced'], weight: 0 },
          { id: 'craving', label: 'I want more connection', tags: ['social:wants'], weight: 1 },
        ],
      },
      {
        id: 'support-people',
        text: 'Is there at least one person you could talk to about something difficult?',
        responseType: 'boolean',
        options: [
          { id: 'yes', label: 'Yes', tags: ['social:support'], weight: 0 },
          { id: 'no', label: 'Not right now', tags: ['social:no_support'], weight: 3 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'isolated',
        label: 'Feeling isolated',
        allTags: ['social:isolated'],
        priority: 10,
        summary:
          'You feel lonely right now. Tiny, low-pressure connection — a short message, a shared walk — often helps more than big social plans.',
        priorities: ['Feeling connected'],
        recommend: {
          activities: ['act-connect-someone'],
          habits: ['habit-social-touch'],
          games: ['story-choices', 'emotion-detective'],
          journalPrompts: ['jp-kind-self'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Notice', actions: ['Write names of people you like talking to'] },
            { day: 2, focus: 'Reach', actions: ['Send one short message'] },
            { day: 3, focus: 'Share', actions: ['Share one small true thing with someone'] },
            { day: 4, focus: 'Listen', actions: ['Ask someone how they are doing and listen'] },
            { day: 5, focus: 'Plan', actions: ['Arrange one small plans for next week'] },
            { day: 6, focus: 'Kindness', actions: ['Do a small kind act'] },
            { day: 7, focus: 'Review', actions: ['Note how connected you feel compared to day 1'] },
          ],
        },
      },
      {
        id: 'no-support-person',
        label: 'No support person',
        allTags: ['social:no_support'],
        priority: 5,
        summary:
          'It is hard not to have anyone to talk to. Building one small connection is a meaningful goal — and if things ever feel heavy, reaching out to a counselor or helpline is a strong step, not a weak one.',
        priorities: ['Finding one trusted person'],
        recommend: {
          activities: ['act-connect-someone'],
          journalPrompts: ['jp-kind-self'],
        },
      },
      {
        id: 'connected',
        label: 'Well connected',
        allTags: ['social:connected', 'social:support'],
        priority: 60,
        summary: 'You have people around you and support to lean on. That is worth protecting.',
        priorities: ['Keeping my connections'],
        recommend: { habits: ['habit-social-touch'], journalPrompts: ['jp-gratitude'] },
      },
    ],
  },
  {
    code: 'digital-wellbeing',
    version: '1.0.0',
    title: 'Digital wellbeing',
    description: 'Reflect on how screens and notifications shape your day.',
    category: 'digital',
    ageGroups: ['teen', 'adult'],
    estimatedMinutes: 3,
    status: 'published',
    intro: 'Screens are part of life. This check-in looks at how they affect you, without judgement.',
    outro: 'Here are small changes that can give you back time and attention.',
    questions: [
      {
        id: 'screen-feeling',
        text: 'How do you feel after long screen sessions?',
        responseType: 'single_choice',
        options: [
          { id: 'fine', label: 'Mostly fine', tags: ['digital:balanced'], weight: 0 },
          { id: 'drained', label: 'Drained or foggy', tags: ['digital:drained'], weight: 2 },
          { id: 'wired', label: 'Wired and unable to settle', tags: ['digital:wired'], weight: 2 },
          { id: 'guilty', label: 'Guilty about the time', tags: ['digital:guilty'], weight: 2 },
        ],
      },
      {
        id: 'night-screens',
        text: 'How often do you use screens in bed?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Every night'],
        ratingRules: [
          { max: 2, tags: ['digital:limited'], weight: 0 },
          { min: 3, max: 3, tags: ['digital:some'], weight: 1 },
          { min: 4, tags: ['digital:heavy'], weight: 2 },
        ],
      },
      {
        id: 'notification-feeling',
        text: 'How do constant notifications affect you?',
        responseType: 'single_choice',
        options: [
          { id: 'ok', label: 'I barely notice them', tags: ['digital:balanced'], weight: 0 },
          { id: 'distracted', label: 'They break my focus', tags: ['digital:distracted'], weight: 2 },
          { id: 'anxious', label: 'They make me anxious', tags: ['digital:distracted'], weight: 2 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'digital-strain',
        label: 'Digital strain',
        anyTags: ['digital:drained', 'digital:wired', 'digital:guilty', 'digital:distracted'],
        minWeight: 2,
        priority: 15,
        summary:
          'Screens are costing you more than they give. Two changes help most: a notification tidy-up and a screen-free wind-down before bed.',
        priorities: ['Calmer screen habits'],
        recommend: {
          habits: ['habit-screen-curfew', 'habit-breathing-break'],
          activities: ['act-name-emotions'],
          games: ['calm-dragon'],
        },
      },
      {
        id: 'heavy-night-screens',
        label: 'Heavy night screen use',
        allTags: ['digital:heavy'],
        priority: 20,
        summary: 'Night-time screens are likely eating into your wind-down. Try a bedroom charging spot outside the room.',
        priorities: ['A calmer bedtime'],
        recommend: { habits: ['habit-screen-curfew'], activities: ['act-bedtime-routine'] },
      },
    ],
  },
  {
    code: 'strengths-interests',
    version: '1.0.0',
    title: 'Strengths and interests',
    description: 'Notice what you are good at and what gives you energy.',
    category: 'strengths',
    ageGroups: ['child', 'teen', 'adult', 'older_adult'],
    estimatedMinutes: 3,
    status: 'published',
    intro: 'Focusing on strengths is not denial — it is fuel. Let us find yours.',
    outro: 'Here are activities that build on your strengths.',
    questions: [
      {
        id: 'strength-pick',
        text: 'Which strengths sound most like you?',
        helpText: 'Choose up to 3.',
        responseType: 'multi_choice',
        maxSelections: 3,
        options: [
          { id: 'curious', label: 'Curious', tags: ['strength:curious'] },
          { id: 'kind', label: 'Kind', tags: ['strength:kind'] },
          { id: 'persistent', label: 'Persistent', tags: ['strength:persistent'] },
          { id: 'creative', label: 'Creative', tags: ['strength:creative'] },
          { id: 'humor', label: 'Funny or cheerful', tags: ['strength:humor'] },
          { id: 'steady', label: 'Calm and steady', tags: ['strength:steady'] },
          { id: 'unsure', label: 'I am not sure yet', tags: ['strength:exploring'], weight: 1 },
        ],
        ageVariants: {
          child: {
            text: 'Which of these are like you?',
            options: [
              { id: 'curious', label: 'I like finding things out', tags: ['strength:curious'] },
              { id: 'kind', label: 'I care about others', tags: ['strength:kind'] },
              { id: 'persistent', label: 'I keep trying', tags: ['strength:persistent'] },
              { id: 'creative', label: 'I like making things', tags: ['strength:creative'] },
              { id: 'humor', label: 'I make people laugh', tags: ['strength:humor'] },
              { id: 'steady', label: 'I stay calm', tags: ['strength:steady'] },
            ],
          },
        },
      },
      {
        id: 'energy-activities',
        text: 'Which activities give you energy?',
        helpText: 'Choose all that apply.',
        responseType: 'multi_choice',
        maxSelections: 6,
        options: [
          { id: 'making', label: 'Making or building things', tags: ['energy:creative'] },
          { id: 'helping', label: 'Helping people', tags: ['energy:helping'] },
          { id: 'learning', label: 'Learning something new', tags: ['energy:learning'] },
          { id: 'moving', label: 'Being active', tags: ['energy:moving'] },
          { id: 'nature', label: 'Time outdoors', tags: ['energy:nature'] },
          { id: 'quiet', label: 'Quiet time', tags: ['energy:quiet'] },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'kind-strength',
        label: 'Kindness strength',
        allTags: ['strength:kind'],
        priority: 40,
        summary: 'Kindness is one of your strengths. Small kind acts are a genuine wellbeing practice for you.',
        priorities: ['Using my kindness'],
        recommend: {
          habits: ['habit-kindness-act'],
          activities: ['act-kindness-quest'],
          games: ['emotion-detective'],
        },
      },
      {
        id: 'exploring-strengths',
        label: 'Exploring strengths',
        allTags: ['strength:exploring'],
        priority: 30,
        summary: 'You are still mapping your strengths — that is a great place to start. Try activities from different areas and notice your energy.',
        priorities: ['Discovering my strengths'],
        recommend: {
          games: ['pattern-planet', 'emotion-detective', 'memory-garden'],
          journalPrompts: ['jp-energy-map'],
          reflections: ['ref-energy-audit'],
        },
      },
      {
        id: 'curious-strength',
        label: 'Curiosity strength',
        anyTags: ['strength:curious'],
        priority: 45,
        summary: 'Curiosity is a strength you can lean on: learning something small each day suits you.',
        priorities: ['Learning something new'],
        recommend: { games: ['pattern-planet', 'cognitive-sprint'], journalPrompts: ['jp-energy-map'] },
      },
    ],
  },
  {
    code: 'lifestyle-balance',
    version: '1.0.0',
    title: 'Lifestyle balance',
    description: 'A whole-life view of work, rest, people and play.',
    category: 'lifestyle',
    ageGroups: ['teen', 'adult', 'older_adult'],
    estimatedMinutes: 4,
    status: 'published',
    intro: 'Balance is not equal hours — it is enough of what matters. Let us look at your week.',
    outro: 'Here are adjustments that match your answers.',
    questions: [
      {
        id: 'overloaded',
        text: 'How often do you feel overloaded?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Rarely', 'Sometimes', 'About half the time', 'Often', 'Almost always'],
        ratingRules: [
          { max: 2, tags: ['balance:ok'], weight: 0 },
          { min: 3, max: 3, tags: ['balance:stretch'], weight: 1 },
          { min: 4, tags: ['balance:overloaded'], weight: 3 },
        ],
      },
      {
        id: 'life-areas',
        text: 'Which area feels most neglected?',
        responseType: 'single_choice',
        options: [
          { id: 'rest', label: 'Rest and sleep', tags: ['balance:needs_sleep'] },
          { id: 'people', label: 'People I care about', tags: ['balance:needs_people'] },
          { id: 'fun', label: 'Fun and play', tags: ['balance:needs_fun'] },
          { id: 'health', label: 'My physical health', tags: ['balance:needs_health'] },
          { id: 'growth', label: 'Learning and growth', tags: ['balance:needs_growth'] },
        ],
      },
      {
        id: 'recovery',
        text: 'How restored do you feel after a day off?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Not at all', 'Barely', 'Somewhat', 'Mostly', 'Fully'],
        ratingRules: [
          { max: 2, tags: ['balance:poor_recovery'], weight: 2 },
          { min: 3, max: 3, tags: ['balance:partial_recovery'], weight: 1 },
          { min: 4, tags: ['balance:good_recovery'], weight: 0 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'overloaded-life',
        label: 'Overloaded',
        allTags: ['balance:overloaded'],
        priority: 10,
        summary:
          'You feel overloaded most of the time. The goal is not to do more self-care on top of a full plate — it is to remove or shrink one commitment and protect one recovery ritual.',
        priorities: ['Reducing overload'],
        recommend: {
          journalPrompts: ['jp-energy-map'],
          activities: ['act-gentle-mobility', 'act-name-emotions'],
          games: ['calm-dragon', 'habit-architect'],
          reflections: ['ref-energy-audit'],
        },
        planTemplate: {
          days: [
            { day: 1, focus: 'Map it', actions: ['List everything taking your time'] },
            { day: 2, focus: 'Trim', actions: ['Shrink or drop one low-value thing'] },
            { day: 3, focus: 'Protect rest', actions: ['Block 30 minutes of true downtime'] },
            { day: 4, focus: 'Move gently', actions: ['5 minutes of gentle mobility'] },
            { day: 5, focus: 'Connect', actions: ['Spend unhurried time with one person'] },
            { day: 6, focus: 'Play', actions: ['Do something purely for fun'] },
            { day: 7, focus: 'Review', actions: ['Note which change helped most'] },
          ],
        },
      },
      {
        id: 'needs-fun',
        label: 'Needs more play',
        allTags: ['balance:needs_fun'],
        priority: 25,
        summary: 'Fun has slipped off your list. Play is not a reward for finishing everything — it is part of a sustainable week.',
        priorities: ['More fun'],
        recommend: {
          games: ['story-choices', 'gratitude-quest'],
          activities: ['act-kindness-quest'],
          journalPrompts: ['jp-gratitude'],
        },
      },
    ],
  },
  {
    code: 'weekly-reflection',
    version: '1.0.0',
    title: 'Weekly reflection',
    description: 'A short guided review of your week.',
    category: 'reflection',
    ageGroups: ['teen', 'adult', 'older_adult'],
    estimatedMinutes: 5,
    status: 'published',
    intro: 'A weekly pause helps you steer. Answer from this week specifically.',
    outro: 'Your reflection is saved. Here are suggested next steps.',
    questions: [
      {
        id: 'week-mood',
        text: 'How would you rate this week overall?',
        responseType: 'rating',
        ratingMin: 1,
        ratingMax: 5,
        ratingLabels: ['Tough', 'Hard', 'Mixed', 'Good', 'Great'],
        ratingRules: [
          { max: 2, tags: ['week:tough'], weight: 3 },
          { min: 3, max: 3, tags: ['week:mixed'], weight: 1 },
          { min: 4, tags: ['week:good'], weight: 0 },
        ],
      },
      {
        id: 'week-highlight',
        text: 'What was the highlight of your week?',
        responseType: 'short_text',
        required: false,
        default: '',
        maxLength: 300,
        options: [],
      },
      {
        id: 'week-struggle',
        text: 'What was the hardest part?',
        responseType: 'short_text',
        required: false,
        default: '',
        maxLength: 300,
        options: [],
      },
      {
        id: 'week-habits',
        text: 'Which wellness habit did you keep this week?',
        responseType: 'single_choice',
        options: [
          { id: 'sleep', label: 'Sleep routine', tags: ['habit:sleep'] },
          { id: 'move', label: 'Movement', tags: ['habit:movement'] },
          { id: 'calm', label: 'A calm practice', tags: ['habit:mindful'] },
          { id: 'journal', label: 'Journaling', tags: ['habit:journal'] },
          { id: 'none', label: 'None yet', tags: ['week:no_habit'], weight: 1 },
        ],
      },
    ],
    interpretationRules: [
      {
        id: 'tough-week',
        label: 'Tough week',
        allTags: ['week:tough'],
        priority: 10,
        summary: 'This week was hard. Be specific about what made it hard, then choose one small thing to change — not five.',
        priorities: ['One small change'],
        recommend: {
          journalPrompts: ['jp-worry-dump', 'jp-kind-self'],
          games: ['calm-dragon', 'thought-detective'],
          activities: ['act-name-emotions'],
        },
      },
      {
        id: 'no-habit-kept',
        label: 'No habit yet',
        allTags: ['week:no_habit'],
        priority: 20,
        summary: 'No habit stuck this week — that is data, not failure. Shrink the habit until it feels almost too easy.',
        priorities: ['An easier habit'],
        recommend: { games: ['habit-architect'], habits: ['habit-breathing-break'] },
      },
      {
        id: 'good-week',
        label: 'Good week',
        allTags: ['week:good'],
        priority: 50,
        summary: 'A good week! Note what made it work so you can rebuild those conditions on harder weeks.',
        priorities: ['Repeating what worked'],
        recommend: { journalPrompts: ['jp-gratitude'], reflections: ['ref-win-log'] },
      },
    ],
  },
];

const BANK_SEEDS_BY_CODE = new Map(BANK_ASSESSMENT_SEEDS.map((s) => [s.code, s]));

export const ASSESSMENT_SEEDS: AssessmentSeed[] = [
  ...LEGACY_ASSESSMENT_SEEDS.map((s) => BANK_SEEDS_BY_CODE.get(s.code) ?? s),
  ...BANK_ASSESSMENT_SEEDS.filter((s) => !LEGACY_ASSESSMENT_SEEDS.some((l) => l.code === s.code)),
];

export function getAssessmentSeed(code: string): AssessmentSeed | undefined {
  return ASSESSMENT_SEEDS.find((a) => a.code === code);
}

