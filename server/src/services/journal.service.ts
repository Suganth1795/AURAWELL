import { JournalEntry, type UserDoc } from '../models/index.js';
import { HttpError } from '../middleware/error.js';
import { contentForAge, getContentItem } from '../data/wellnessContent.js';
import { touchDailyActivity, type TouchResult } from './wellness.service.js';

export interface JournalEntryInput {
  title?: string;
  content: string;
  tags?: string[];
  promptId?: string;
}

export interface JournalEntryDto {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  promptId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toJournalDto(doc: {
  _id: unknown;
  title?: string | null;
  content: string;
  tags?: string[];
  promptId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): JournalEntryDto {
  return {
    id: String(doc._id),
    title: doc.title ?? null,
    content: doc.content,
    tags: doc.tags ?? [],
    promptId: doc.promptId ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function createJournalEntry(
  user: UserDoc,
  input: JournalEntryInput,
): Promise<{ entry: JournalEntryDto; reward: TouchResult }> {
  if (input.promptId && !getContentItem(input.promptId)) {
    throw new HttpError(400, 'Unknown journal prompt', 'unknown_prompt');
  }
  const entry = await JournalEntry.create({
    userId: user._id,
    title: input.title,
    content: input.content,
    tags: input.tags ?? [],
    promptId: input.promptId,
  });
  const reward = await touchDailyActivity(user);
  return { entry: toJournalDto(entry), reward };
}

export async function listJournalEntries(
  user: UserDoc,
  options: { skip: number; limit: number; tag?: string; search?: string },
): Promise<{ items: JournalEntryDto[]; total: number }> {
  const filter: Record<string, unknown> = { userId: user._id, deletedAt: null };
  if (options.tag) filter.tags = options.tag;
  if (options.search) filter.$text = { $search: options.search };

  const [docs, total] = await Promise.all([
    JournalEntry.find(filter).sort({ createdAt: -1 }).skip(options.skip).limit(options.limit),
    JournalEntry.countDocuments(filter),
  ]);
  return { items: docs.map(toJournalDto), total };
}

export async function getJournalEntry(user: UserDoc, id: string): Promise<JournalEntryDto> {
  const doc = await JournalEntry.findOne({ _id: id, userId: user._id, deletedAt: null });
  if (!doc) throw new HttpError(404, 'Journal entry not found', 'not_found');
  return toJournalDto(doc);
}

export async function updateJournalEntry(
  user: UserDoc,
  id: string,
  input: Partial<JournalEntryInput>,
): Promise<JournalEntryDto> {
  const doc = await JournalEntry.findOne({ _id: id, userId: user._id, deletedAt: null });
  if (!doc) throw new HttpError(404, 'Journal entry not found', 'not_found');
  if (input.title !== undefined) doc.title = input.title;
  if (input.content !== undefined) doc.content = input.content;
  if (input.tags !== undefined) doc.tags = input.tags;
  await doc.save();
  return toJournalDto(doc);
}

export async function deleteJournalEntry(user: UserDoc, id: string): Promise<void> {
  const doc = await JournalEntry.findOne({ _id: id, userId: user._id, deletedAt: null });
  if (!doc) throw new HttpError(404, 'Journal entry not found', 'not_found');
  doc.deletedAt = new Date();
  await doc.save();
}

export interface JournalPromptDto {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  tags: string[];
}

/** Journal prompts appropriate for the user's age group, drawn from wellness content. */
export function journalPromptsFor(user: UserDoc): JournalPromptDto[] {
  return contentForAge(user.ageGroup)
    .filter((item) => item.kind === 'journal_prompt')
    .map((item) => ({
      id: item.code,
      title: item.title,
      description: item.description,
      estimatedMinutes: item.estimatedMinutes,
      tags: item.tags,
    }));
}
