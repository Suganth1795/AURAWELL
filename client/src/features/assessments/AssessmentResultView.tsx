import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Info,
  Sparkles,
  Target,
  Music,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useMusicStore } from '@/features/music/musicStore';
import { musicCatalog } from '@/features/music/musicCatalog';
import type { AssessmentResult } from './types';

const INDICATOR_LABELS: Record<string, string> = {
  emotions: 'Emotions & Mood',
  calm: 'Calm & Relaxation',
  stress: 'Stress & Pressure',
  anxiety: 'Anxiety & Worry',
  sleep: 'Sleep & Rest',
  focus: 'Focus & Concentration',
  movement: 'Physical Movement',
  social: 'Social Connection',
  digital: 'Digital Wellbeing',
  balance: 'Life Balance',
  coping: 'Resilience & Coping',
  week: 'Weekly Rhythm',
  barrier: 'Action Barrier',
  joy: 'Joy & Glimmers',
  esteem: 'Self-Esteem',
  burnout: 'Energy & Fatigue',
  motivation: 'Motivation & Drive',
  anger: 'Emotional Regulation',
  gratitude: 'Gratitude & Appreciation',
  lifestyle: 'Lifestyle Habits',
};

const SUGGESTION_KIND_LABELS: Record<string, string> = {
  game: 'Game',
  habit: 'Habit',
  journal_prompt: 'Journal prompt',
  sleep_routine: 'Sleep routine',
  activity: 'Activity',
  reflection: 'Reflection',
  breathing: 'Breathing practice',
  soundscape: 'Peaceful Soundscape',
};

export function AssessmentResultView({
  result,
  onRetake,
}: {
  result: AssessmentResult;
  onRetake?: () => void;
}): React.JSX.Element {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playbackStatus = useMusicStore((s) => s.playbackStatus);
  const playTrack = useMusicStore((s) => s.playTrack);
  const togglePlay = useMusicStore((s) => s.togglePlay);

  const indicatorEntries = Object.entries(result.indicators);

  const soundscapeSuggestions = result.suggestions.filter((s) => s.kind === 'soundscape');
  const generalSuggestions = result.suggestions.filter((s) => s.kind !== 'soundscape');

  function toggleAction(dayNum: number, actionIdx: number) {
    const key = `${dayNum}-${actionIdx}`;
    setCompletedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function findCatalogTrack(suggestionCode: string) {
    return (
      musicCatalog.find((t) => t.id === suggestionCode) ||
      musicCatalog.find((t) => t.id.includes(suggestionCode) || suggestionCode.includes(t.id)) ||
      musicCatalog[0]
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Reflection Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reflection Summary</CardTitle>
          <CardDescription>
            Completed {new Date(result.completedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
          <Alert variant="info" role="status">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              {result.disclaimer}
            </span>
          </Alert>
        </CardContent>
      </Card>

      {/* Wellness Indicators */}
      {indicatorEntries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Wellness Indicators</CardTitle>
            <CardDescription>
              Self-reported reflection areas (0–100 non-diagnostic scale). Values above 65 represent strengths; lower values indicate areas for gentle nurturing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicatorEntries.map(([domain, value]) => (
              <div key={domain} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {INDICATOR_LABELS[domain] ?? domain.replace(/_/g, ' ')}
                  </span>
                  <span className="tabular-nums font-semibold text-muted-foreground">{value}/100</span>
                </div>
                <div
                  role="meter"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={INDICATOR_LABELS[domain] ?? domain}
                  className="h-2.5 overflow-hidden rounded-full bg-muted/80"
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      value >= 70 ? 'bg-emerald-500' : value >= 45 ? 'bg-sky-500' : 'bg-amber-500',
                    )}
                    style={{ width: `${Math.max(5, value)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Suggested Priorities */}
      {result.priorities.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" /> Suggested Priorities
            </CardTitle>
            <CardDescription>Focus areas derived from your reflection answers.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.priorities.map((priority) => (
              <Badge key={priority} variant="default" className="text-xs">
                {priority}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Curated Soundscapes Section */}
      {soundscapeSuggestions.length > 0 ? (
        <Card className="border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-card to-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sky-400">
              <Music className="h-4 w-4" aria-hidden="true" /> Recommended Soundscapes
            </CardTitle>
            <CardDescription>
              Curated soothing audio paired with your assessment results to help center and relax your mind.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {soundscapeSuggestions.map((suggestion) => {
              const track = findCatalogTrack(suggestion.code);
              const isCurrent = currentTrack?.id === track?.id;
              const isPlaying = isCurrent && playbackStatus === 'playing';

              return (
                <div
                  key={`${suggestion.kind}:${suggestion.code}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-sky-500/50 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-foreground group-hover:text-sky-400 transition-colors">
                          {suggestion.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Volume2 className="h-3 w-3 text-sky-400" />
                          <span>{track?.category ?? 'Peaceful Soundscape'}</span>
                          <span>·</span>
                          <span>~{suggestion.estimatedMinutes} min</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px]">
                        Soundscape
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {suggestion.explanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {isPlaying ? 'Currently playing' : 'Ready to listen'}
                    </span>
                    <Button
                      size="sm"
                      variant={isPlaying ? 'default' : 'outline'}
                      className={cn(
                        'gap-1.5 text-xs',
                        isPlaying ? 'bg-sky-500 hover:bg-sky-600' : 'border-sky-500/40 text-sky-400 hover:bg-sky-500/10',
                      )}
                      onClick={() => {
                        if (isPlaying) {
                          togglePlay();
                        } else if (track) {
                          playTrack(track);
                        }
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" /> Play Soundscape
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* General Suggestions (Habits, Prompts, Games) */}
      {generalSuggestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Recommended Activities & Practices
            </CardTitle>
            <CardDescription>Practical actions tailored to your reflection responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {generalSuggestions.map((suggestion) => (
              <div
                key={`${suggestion.kind}:${suggestion.code}`}
                className="rounded-xl border border-border bg-card/60 p-3.5 transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{suggestion.title}</span>
                  <Badge variant="secondary">
                    {SUGGESTION_KIND_LABELS[suggestion.kind] ?? suggestion.kind}
                  </Badge>
                </div>
                {suggestion.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {suggestion.explanation} · ~{suggestion.estimatedMinutes} min
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* 7-Day Plan with Interactive Checkboxes */}
      {result.sevenDayPlan.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /> Your 7-Day Action Plan
                </CardTitle>
                <CardDescription>
                  A progressive, manageable roadmap. Track your daily steps throughout the week.
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {Object.values(completedActions).filter(Boolean).length} completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {result.sevenDayPlan.map((day) => (
                <li key={day.day} className="flex gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {day.day}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">{day.focus}</p>
                    <div className="space-y-1">
                      {day.actions.map((action, idx) => {
                        const key = `${day.day}-${idx}`;
                        const isDone = Boolean(completedActions[key]);
                        return (
                          <label
                            key={action}
                            className={cn(
                              'flex items-start gap-2.5 cursor-pointer text-xs transition-colors rounded p-1 hover:bg-muted/40',
                              isDone ? 'text-muted-foreground line-through' : 'text-foreground/90',
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleAction(day.day, idx)}
                              className="mt-0.5 rounded border-muted-foreground/40 text-primary focus:ring-primary"
                            />
                            <span>{action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/assessments" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to assessments
        </Link>
        <Link to="/music" className={cn(buttonVariants({ variant: 'outline' }))}>
          <Music className="mr-1.5 h-4 w-4 text-sky-400" /> Explore all soundscapes
        </Link>
        <Link to="/dashboard" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Go to dashboard
        </Link>
        {onRetake ? (
          <button type="button" onClick={onRetake} className={cn(buttonVariants({ variant: 'link' }))}>
            Retake this check-in
          </button>
        ) : null}
      </div>
    </div>
  );
}
