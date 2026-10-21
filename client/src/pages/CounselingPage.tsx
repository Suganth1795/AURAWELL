import { useState } from 'react';
import { LifeBuoy, MessageCircle, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { counselingService } from '@/features/counseling/counselingService';
import type { ChatMessage, ChatSession } from '@/features/counseling/types';

export function CounselingPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const isChild = user?.ageGroup === 'child';

  const { data, error, loading, reload } = useAsync(async () => {
    const [intro, sessions, status] = await Promise.all([
      counselingService.intro(),
      counselingService.listSessions(),
      counselingService.aiStatus(),
    ]);
    return { intro, sessions, status };
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function startConversation(): Promise<void> {
    setStarting(true);
    setActionError(null);
    try {
      const session = await counselingService.createSession();
      setActiveId(session.id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not start a conversation.');
    } finally {
      setStarting(false);
    }
  }

  async function removeSession(id: string): Promise<void> {
    setActionError(null);
    try {
      await counselingService.deleteSession(id);
      if (activeId === id) setActiveId(null);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not delete that conversation.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isChild ? 'Guided Time' : 'AURA'}
        description={
          isChild
            ? 'A safe space with calming activities and gentle questions. A grown-up can look at this with you.'
            : 'A supportive wellness companion for reflection. It is not a doctor or therapist and does not provide medical advice.'
        }
      />

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {actionError ? <Alert variant="error">{actionError}</Alert> : null}
      {loading ? <LoadingState label="Loading AURA…" /> : null}

      {data ? (
        <>
          {data.intro ? (
            <Alert variant="info" role="status">
              <span>{data.intro.disclaimer}</span>
            </Alert>
          ) : null}

          {!data.status.configured ? (
            <Alert variant="warning" role="status">
              AURA is running in offline reflection mode. Replies are generated on our servers
              without sending anything to an external AI provider.
            </Alert>
          ) : null}

          {activeId ? (
            <ChatView
              sessionId={activeId}
              crisisResources={data.intro.crisisResources}
              onBack={() => setActiveId(null)}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isChild ? 'Start guided time' : 'Start a conversation'}
                  </CardTitle>
                  <CardDescription>
                    {isChild
                      ? 'AURA will share short, calming activities.'
                      : 'Share what is on your mind and reflect together.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={startConversation} disabled={starting}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {starting ? 'Starting…' : 'New conversation'}
                  </Button>

                  {data.sessions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recent conversations</p>
                      <ul className="space-y-2">
                        {data.sessions.map((session) => (
                          <SessionRow
                            key={session.id}
                            session={session}
                            onOpen={() => setActiveId(session.id)}
                            onDelete={() => removeSession(session.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <SupportPanel resources={data.intro.crisisResources} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function SessionRow({
  session,
  onOpen,
  onDelete,
}: {
  session: ChatSession;
  onOpen: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  return (
    <li className="flex items-center justify-between gap-2 border-b pb-2 last:border-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 truncate text-left text-sm hover:underline"
      >
        {session.title}
        <span className="ml-2 text-xs text-muted-foreground">
          {new Date(session.lastMessageAt).toLocaleDateString()}
        </span>
      </button>
      <Button variant="ghost" size="icon" aria-label="Delete conversation" onClick={onDelete}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </li>
  );
}

export function SupportPanel({
  resources,
}: {
  resources: { region: string; name: string; contact: string }[];
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LifeBuoy className="h-4 w-4 text-primary" aria-hidden="true" />
          If you need urgent help
        </CardTitle>
        <CardDescription>
          AURA cannot provide emergency support. The people below can help right now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {resources.map((resource) => (
            <li key={resource.region}>
              <span className="font-medium">{resource.region}:</span> {resource.name} —{' '}
              <span className="text-muted-foreground">{resource.contact}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ChatView({
  sessionId,
  crisisResources,
  onBack,
}: {
  sessionId: string;
  crisisResources: { region: string; name: string; contact: string }[];
  onBack: () => void;
}): React.JSX.Element {
  const { data, error, loading, reload } = useAsync(
    () => counselingService.getSession(sessionId),
    [sessionId],
  );
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentCrisis, setSentCrisis] = useState(false);
  const [closing, setClosing] = useState(false);

  const crisisSeen =
    sentCrisis || Boolean(data?.messages.some((m) => m.safetyLevel === 'crisis_support'));

  async function handleClose(): Promise<void> {
    setClosing(true);
    setSendError(null);
    try {
      await counselingService.closeSession(sessionId);
      reload();
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'Could not close this conversation.');
    } finally {
      setClosing(false);
    }
  }

  async function handleSend(): Promise<void> {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setSendError(null);
    try {
      const result = await counselingService.sendMessage(sessionId, content);
      setDraft('');
      if (result.assistantMessage.safetyLevel === 'crisis_support') setSentCrisis(true);
      reload();
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'Could not send your message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">{data?.session.title ?? 'Conversation'}</CardTitle>
          <CardDescription>
            {data?.session.status === 'closed'
              ? 'This conversation is closed.'
              : 'AURA is here to listen.'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {data?.session.status !== 'closed' ? (
            <Button variant="outline" size="sm" onClick={handleClose} disabled={closing}>
              {closing ? 'Closing…' : 'Close'}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {crisisSeen ? (
          <div className="space-y-3">
            <Alert variant="error" role="alert">
              <span className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  It sounds like you may be going through something serious. Please reach out to a
                  crisis line or a trusted person right now — the contacts are listed below.
                </span>
              </span>
            </Alert>
            <SupportPanel resources={crisisResources} />
          </div>
        ) : null}

        {error ? <Alert variant="error">{error.message}</Alert> : null}
        {loading ? <LoadingState label="Loading conversation…" /> : null}

        {data ? (
          <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1" aria-live="polite">
            {data.messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Say hello to begin. Nothing is shared with anyone outside the app.
              </p>
            ) : (
              data.messages.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
          </div>
        ) : null}

        {data?.session.status === 'closed' ? (
          <Alert variant="info">
            This conversation is closed. Start a new one to keep talking.
          </Alert>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="space-y-2"
          >
            <label htmlFor="aura-input" className="sr-only">
              Your message
            </label>
            <Textarea
              id="aura-input"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share what is on your mind…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            {sendError ? <Alert variant="error">{sendError}</Alert> : null}
            <Button type="submit" disabled={sending || !draft.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }): React.JSX.Element {
  const isUser = message.role === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground'
            : 'max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm'
        }
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && message.safetyLevel !== 'none' ? (
            <Badge variant="warning">Safety support</Badge>
          ) : null}
          {!isUser && message.source === 'fallback' ? (
            <Badge variant="outline">Offline reflection</Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
