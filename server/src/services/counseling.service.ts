import { ChatMessage as ChatMessageModel, ChatSession, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import { contentForAge, type WellnessContentItem } from '../data/wellnessContent.js';
import { getChatProvider, FallbackChatProvider } from '../ai/index.js';
import type { ChatMessage } from '../ai/types.js';
import { logger } from '../utils/logger.js';
import { assessSafety, type SafetyLevel } from './safety.service.js';

export interface ChatSessionDto {
  id: string;
  title: string;
  status: 'active' | 'closed';
  ageGroup: string;
  safetyFlags: string[];
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  safetyLevel: SafetyLevel;
  source: 'llm' | 'fallback' | 'canned';
  createdAt: string;
}

export interface SendMessageResult {
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
}

function sessionToDto(doc: {
  _id: unknown;
  title: string;
  status: 'active' | 'closed';
  ageGroup: string;
  safetyFlags?: string[];
  lastMessageAt: Date;
  createdAt: Date;
}): ChatSessionDto {
  return {
    id: String(doc._id),
    title: doc.title,
    status: doc.status,
    ageGroup: doc.ageGroup,
    safetyFlags: doc.safetyFlags ?? [],
    lastMessageAt: doc.lastMessageAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

function messageToDto(doc: {
  _id: unknown;
  role: 'user' | 'assistant';
  content: string;
  safetyLevel: SafetyLevel;
  source: 'llm' | 'fallback' | 'canned';
  createdAt: Date;
}): ChatMessageDto {
  return {
    id: String(doc._id),
    role: doc.role,
    content: doc.content,
    safetyLevel: doc.safetyLevel,
    source: doc.source,
    createdAt: doc.createdAt.toISOString(),
  };
}

const SYSTEM_PROMPT = [
  'You are AURA, a warm and supportive wellness companion inside the AuraWell AI app.',
  'You are NOT a doctor or therapist and you must never diagnose, prescribe, or claim to treat anything.',
  'Offer reflective listening, gentle validation, and practical, evidence-informed coping suggestions.',
  'Keep replies concise (2-5 short paragraphs), use plain language, and ask at most one question.',
  'If someone describes self-harm or crisis, encourage them to contact emergency services or a crisis line and a trusted person immediately.',
  'If asked for medical advice, explain you cannot give it and suggest speaking to a professional.',
  'Never claim confidentiality beyond the app, and never promise outcomes.',
].join(' ');

const CHILD_ACTIVITIES: { title: string; body: string }[] = [
  { title: 'Feelings detective', body: 'Can you name two feelings you noticed today and where you felt them in your body?' },
  { title: 'Bubble breathing', body: "Let's take three slow breaths. Pretend you're blowing up a big bubble on each breath out." },
  { title: 'Kindness mission', body: 'What is one kind thing you could do for someone today? It can be tiny.' },
  { title: 'Cozy corner', body: 'Where is your favourite calm spot? Imagine being there for a moment.' },
];

function childSupportiveReply(text: string): string {
  const activity = CHILD_ACTIVITIES[text.length % CHILD_ACTIVITIES.length];
  return [
    'Thanks for telling me. You are doing a great job sharing how you feel.',
    '',
    `Let's try a little activity together — "${activity.title}".`,
    activity.body,
    '',
    'If a big feeling sticks around, talking to a grown-up you trust is always a good idea.',
  ].join('\n');
}

export async function listSessions(user: UserDoc): Promise<ChatSessionDto[]> {
  const docs = await ChatSession.find({ userId: user._id }).sort({ lastMessageAt: -1 }).limit(50);
  return docs.map(sessionToDto);
}

export async function createSession(user: UserDoc, title?: string): Promise<ChatSessionDto> {
  const doc = await ChatSession.create({
    userId: user._id,
    title: title ?? 'New conversation',
    ageGroup: user.ageGroup,
  });
  return sessionToDto(doc);
}

async function requireOwnedSession(user: UserDoc, id: string) {
  const session = await ChatSession.findOne({ _id: id, userId: user._id });
  if (!session) throw new HttpError(404, 'Conversation not found', 'not_found');
  return session;
}

export async function getSessionWithMessages(
  user: UserDoc,
  id: string,
): Promise<{ session: ChatSessionDto; messages: ChatMessageDto[] }> {
  const session = await requireOwnedSession(user, id);
  const messages = await ChatMessageModel.find({ sessionId: session._id }).sort({ createdAt: 1 });
  return { session: sessionToDto(session), messages: messages.map(messageToDto) };
}

export async function closeSession(user: UserDoc, id: string): Promise<ChatSessionDto> {
  const session = await requireOwnedSession(user, id);
  session.status = 'closed';
  await session.save();
  return sessionToDto(session);
}

export async function deleteSession(user: UserDoc, id: string): Promise<void> {
  const session = await requireOwnedSession(user, id);
  await ChatMessageModel.deleteMany({ sessionId: session._id });
  await ChatSession.deleteOne({ _id: session._id });
}

function isCounselingAllowed(user: UserDoc): boolean {
  // Children never receive AI-generated counseling; they get curated activities.
  return user.ageGroup !== 'child';
}

/**
 * Sends a user message and produces an assistant reply.
 *
 * Order of precedence:
 *  1. Deterministic safety screening (crisis / medical-boundary) — always wins.
 *  2. Children: curated structured activity reply (no LLM, no network).
 *  3. Consent + provider: real model when AI data consent is granted and a
 *     provider is configured; otherwise the deterministic reflective fallback.
 */
export async function sendMessage(
  user: UserDoc,
  sessionId: string,
  content: string,
): Promise<SendMessageResult> {
  const session = await requireOwnedSession(user, sessionId);
  if (session.status === 'closed') {
    throw new HttpError(400, 'This conversation is closed', 'session_closed');
  }

  const trimmed = content.trim();
  if (!trimmed) throw new HttpError(400, 'Message cannot be empty', 'empty_message');

  const safety = assessSafety(trimmed, user.ageGroup);

  const userMessage = await ChatMessageModel.create({
    sessionId: session._id,
    userId: user._id,
    role: 'user',
    content: trimmed,
    safetyLevel: safety.level,
    source: 'canned',
  });

  let assistantContent: string;
  let assistantSource: 'llm' | 'fallback' | 'canned';
  const assistantSafety: SafetyLevel = safety.level;

  if (safety.level !== 'none' && safety.response) {
    assistantContent = safety.response;
    assistantSource = 'canned';
  } else if (!isCounselingAllowed(user)) {
    assistantContent = childSupportiveReply(trimmed);
    assistantSource = 'canned';
  } else {
    const configured = getChatProvider();
    // Without explicit AI data consent we NEVER contact a third-party model;
    // the deterministic reflective provider is used entirely on our servers.
    const consent = user.preferences.aiWellnessDataConsent;
    const provider = consent && configured.isConfigured() ? configured : new FallbackChatProvider();
    const history = await ChatMessageModel.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(20);

    const providerMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    ];

    const result = await provider.complete({ messages: providerMessages });
    assistantContent = result.content;
    assistantSource = result.fallback ? 'fallback' : 'llm';
  }

  const assistantMessage = await ChatMessageModel.create({
    sessionId: session._id,
    userId: user._id,
    role: 'assistant',
    content: assistantContent,
    safetyLevel: assistantSafety,
    source: assistantSource,
  });

  if (safety.flag && !session.safetyFlags.includes(safety.flag)) {
    session.safetyFlags.push(safety.flag);
  }
  session.lastMessageAt = new Date();
  if (session.title === 'New conversation') {
    session.title = trimmed.slice(0, 60);
  }
  await session.save();

  logger.debug(
    { sessionId: session.id, safetyLevel: safety.level, source: assistantSource },
    'counseling message handled',
  );

  return {
    userMessage: messageToDto(userMessage),
    assistantMessage: messageToDto(assistantMessage),
  };
}

export interface CounselingIntro {
  disclaimer: string;
  crisisResources: { region: string; name: string; contact: string }[];
  suggestedActivities: { code: string; title: string; description: string }[];
}

export function counselingIntro(user: UserDoc, crisisResources: CounselingIntro['crisisResources']): CounselingIntro {
  const activities: WellnessContentItem[] = contentForAge(user.ageGroup)
    .filter((item) => ['activity', 'breathing', 'reflection', 'journal_prompt', 'sleep_routine'].includes(item.kind))
    .slice(0, 6);

  return {
    disclaimer:
      user.ageGroup === 'child' || user.ageGroup === 'teen'
        ? 'AURA offers supportive activities, not medical advice. If you ever feel unsafe, tell a trusted adult right away.'
        : 'AURA is a supportive wellness companion — not a doctor or therapist. It cannot diagnose or treat any condition.',
    crisisResources,
    suggestedActivities: activities.map((item) => ({
      code: item.code,
      title: item.title,
      description: item.description,
    })),
  };
}
