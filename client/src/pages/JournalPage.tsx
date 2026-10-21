import { useState } from 'react';
import { PenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { journalService } from '@/features/wellness/wellnessService';
import { RewardNote } from '@/features/wellness/RewardNote';
import { useApplyReward } from '@/features/wellness/useApplyReward';
import type { JournalEntry, JournalPrompt, RewardSummary } from '@/features/wellness/types';

export function JournalPage(): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [promptId, setPromptId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const applyReward = useApplyReward();

  const { data, error, loading, reload } = useAsync(async () => {
    const [prompts, entries] = await Promise.all([
      journalService.prompts(),
      journalService.list(1, 20),
    ]);
    return { prompts, entries };
  }, []);

  function resetForm(): void {
    setTitle('');
    setContent('');
    setTagsInput('');
    setPromptId('');
    setEditingId(null);
  }

  function choosePrompt(prompt: JournalPrompt): void {
    setPromptId(prompt.id);
    if (!title) setTitle(prompt.title);
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!content.trim()) {
      setSaveError('Write something before saving.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);

    try {
      if (editingId) {
        await journalService.update(editingId, {
          title: title.trim(),
          content: content.trim(),
          tags,
        });
      } else {
        const result = await journalService.create({
          title: title.trim() || undefined,
          content: content.trim(),
          tags,
          promptId: promptId || undefined,
        });
        setReward(result.reward);
        applyReward(result.reward);
      }
      resetForm();
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your entry.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(entry: JournalEntry): void {
    setEditingId(entry.id);
    setTitle(entry.title ?? '');
    setContent(entry.content);
    setTagsInput(entry.tags.join(', '));
    setPromptId('');
    setReward(null);
  }

  async function handleDelete(id: string): Promise<void> {
    setSaveError(null);
    try {
      await journalService.remove(id);
      if (editingId === id) resetForm();
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not delete that entry.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal"
        description="A private space to write. Entries are only visible to you and are never analysed without your explicit consent."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Edit entry' : 'New entry'}</CardTitle>
            <CardDescription>
              {editingId
                ? 'Update your writing and save when ready.'
                : 'Start from a prompt or write freely.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editingId && data && data.prompts.length > 0 ? (
              <div className="space-y-2">
                <Label>Prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {data.prompts.map((prompt) => (
                    <Button
                      key={prompt.id}
                      type="button"
                      variant={promptId === prompt.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => choosePrompt(prompt)}
                    >
                      {prompt.title}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="journal-title">Title (optional)</Label>
                <Input
                  id="journal-title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this entry a name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="journal-content">Your writing</Label>
                <Textarea
                  id="journal-content"
                  value={content}
                  maxLength={10_000}
                  className="min-h-40"
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What is on your mind?"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="journal-tags">Tags (comma separated, optional)</Label>
                <Input
                  id="journal-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="calm, work, relationships"
                />
              </div>

              {saveError ? <Alert variant="error">{saveError}</Alert> : null}
              {reward ? <RewardNote reward={reward} /> : null}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                  {saving ? 'Saving…' : editingId ? 'Update entry' : 'Save entry'}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your entries</CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? <Alert variant="error">{error.message}</Alert> : null}
            {loading ? <LoadingState label="Loading your journal…" /> : null}
            {data ? (
              <JournalList
                entries={data.entries.items}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JournalList({
  entries,
  onEdit,
  onDelete,
}: {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}): React.JSX.Element {
  if (entries.length === 0) {
    return <Alert variant="info">No entries yet. Your writing will appear here.</Alert>;
  }
  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="space-y-1 border-b pb-4 last:border-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{entry.title ?? 'Untitled'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete journal entry"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.content}</p>
          {entry.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
