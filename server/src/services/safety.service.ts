import type { AgeGroup } from '../utils/ageGroup.js';

export type SafetyLevel = 'none' | 'crisis_support' | 'boundary_redirect';

export interface SafetyAssessment {
  level: SafetyLevel;
  /** Machine-readable reason, stored with the message for auditability. */
  flag: string | null;
  /** Canned, human-written response. Never produced by an LLM. */
  response: string | null;
}

/**
 * Deterministic safety screening. Runs before any LLM call so self-harm,
 * crisis and unsafe-request handling is fully predictable and testable. Only
 * clearly-flagged messages are intercepted; benign mentions (e.g. "this game
 * is killing me") are intentionally not matched.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|killing)\s+myself\b/i,
  /\bend\s+(my\s+life|it\s+all)\b/i,
  /\b(suicid(e|al))\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|wake\s+up)\b/i,
  /\b(no\s+reason\s+to\s+live)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\b(hurt|cut|harm)\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\b(better\s+off\s+(dead|without\s+me))\b/i,
  /\b(plan(ning)?\s+to\s+(kill|hurt)\s+myself)\b/i,
];

const BOUNDARY_PATTERNS: RegExp[] = [
  /\b(diagnos(e|is)|do\s+i\s+have)\b.*\b(depression|bipolar|adhd|ptsd|anxiety\s+disorder|ocd)\b/i,
  /\b(prescribe|prescription|dosage|dose|mg\b|medication|prozac|zoloft|xanax|adderall|ssri)\b/i,
  /\b(stop|change|adjust)\s+(my|taking)\s+(medication|meds|pills)\b/i,
  /\b(should\s+i\s+stop\s+taking)\b/i,
];

function matchAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function detectSafetyLevel(text: string): { level: SafetyLevel; flag: string | null } {
  if (matchAny(text, CRISIS_PATTERNS)) {
    return { level: 'crisis_support', flag: 'possible_self_harm' };
  }
  if (matchAny(text, BOUNDARY_PATTERNS)) {
    return { level: 'boundary_redirect', flag: 'medical_advice_request' };
  }
  return { level: 'none', flag: null };
}

export interface CrisisResource {
  region: string;
  name: string;
  contact: string;
}

/** Real, verifiable crisis resources. Reviews should keep these current. */
export const CRISIS_RESOURCES: CrisisResource[] = [
  { region: 'US', name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988' },
  { region: 'UK & ROI', name: 'Samaritans', contact: 'Call 116 123 (free, 24/7)' },
  { region: 'International', name: 'Find a helpline', contact: 'https://findahelpline.com' },
];

function crisisResponse(ageGroup: AgeGroup): string {
  const minorNote =
    ageGroup === 'child' || ageGroup === 'teen'
      ? 'Please tell a trusted adult — a parent, carer, teacher or school counsellor — right now. You do not have to face this alone.'
      : 'Please reach out to someone you trust, and to a crisis line — they are there for exactly this.';

  const lines = [
    "I'm really glad you told me, and I want you to be safe. I'm a wellness companion, so I can't provide emergency help — but people who can are available right now.",
    '',
    minorNote,
    '',
    'Immediate support:',
    ...CRISIS_RESOURCES.map((r) => `• ${r.region}: ${r.name} — ${r.contact}`),
    '',
    'If you are in immediate danger, contact your local emergency number.',
  ];
  return lines.join('\n');
}

function boundaryResponse(): string {
  return [
    "That's an important question, and it deserves a real clinician rather than an app.",
    '',
    "I can't diagnose conditions, recommend or change medication, or give medical advice. A doctor, pharmacist or licensed mental-health professional can assess your situation properly.",
    '',
    'What I can do is help you reflect: how long has this been weighing on you, and what would make it easier to bring it to a professional?',
  ].join('\n');
}

/** Builds the deterministic, canned safety response for a given level. */
export function safetyResponse(level: SafetyLevel, ageGroup: AgeGroup): string | null {
  if (level === 'crisis_support') return crisisResponse(ageGroup);
  if (level === 'boundary_redirect') return boundaryResponse();
  return null;
}

export function assessSafety(text: string, ageGroup: AgeGroup): SafetyAssessment {
  const { level, flag } = detectSafetyLevel(text);
  return { level, flag, response: safetyResponse(level, ageGroup) };
}
