import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Music, Zap, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/utils/cn';
import type {
  AssessmentAnswer,
  AssessmentDetail,
  AssessmentMode,
  AssessmentQuestion,
} from './types';

interface RunnerProps {
  assessment: AssessmentDetail;
  currentMode?: AssessmentMode;
  onModeChange?: (mode: AssessmentMode) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (answers: AssessmentAnswer[]) => void;
}

function isVisible(
  question: AssessmentQuestion,
  answers: Record<string, AssessmentAnswer>,
): boolean {
  if (!question.conditional) return true;
  const dep = answers[question.conditional.dependsOnQuestionId];
  if (!dep?.optionIds?.length) return false;
  return dep.optionIds.some((id) => question.conditional!.showWhenOptionIds.includes(id));
}

/**
 * The value a rating question shows when the user has not touched the slider.
 * Rating questions always present a concrete value, so an untouched slider
 * counts as an answer rather than blocking submission.
 */
function defaultRating(question: AssessmentQuestion): number {
  const min = question.ratingMin ?? 1;
  const max = question.ratingMax ?? 5;
  return Math.ceil((min + max) / 2);
}

function effectiveRating(question: AssessmentQuestion, answer?: AssessmentAnswer): number {
  return answer?.value ?? defaultRating(question);
}

function isAnswered(question: AssessmentQuestion, answer?: AssessmentAnswer): boolean {
  switch (question.responseType) {
    case 'rating':
      return effectiveRating(question, answer) !== undefined;
    case 'short_text':
      if (question.required === false) return true;
      return (answer?.text ?? '').trim().length > 0;
    default:
      if (question.required === false) return true;
      return (answer?.optionIds?.length ?? 0) > 0;
  }
}

export function AssessmentRunner({
  assessment,
  currentMode = 'standard',
  onModeChange,
  submitting,
  error,
  onSubmit,
}: RunnerProps): React.JSX.Element {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Navigation is stable over the full question list; hidden questions are
  // skipped at render/navigation time, so answering a question never shifts
  // the index of the one the user is looking at.
  const questions = assessment.questions;
  const current = questions[index];

  const visibleCount = useMemo(
    () => questions.filter((q) => isVisible(q, answers)).length,
    [questions, answers],
  );

  const currentAnswer = current ? answers[current.id] : undefined;
  const answered = current ? isAnswered(current, currentAnswer) : false;

  function findNext(from: number, nextAnswers: Record<string, AssessmentAnswer>): number {
    for (let i = from + 1; i < questions.length; i += 1) {
      if (isVisible(questions[i], nextAnswers)) return i;
    }
    return -1;
  }

  const isLast = current ? findNext(index, answers) === -1 : true;

  const answeredVisible = useMemo(
    () => questions.filter((q) => isVisible(q, answers) && isAnswered(q, answers[q.id])).length,
    [questions, answers],
  );
  const progress = visibleCount > 0 ? Math.round(((answeredVisible + 1) / visibleCount) * 100) : 0;

  function setAnswer(questionId: string, patch: Partial<AssessmentAnswer>) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, ...patch },
    }));
  }

  function next() {
    if (!answered) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    const target = findNext(index, answers);
    if (target === -1) {
      submit();
      return;
    }
    setIndex(target);
  }

  function back() {
    setShowErrors(false);
    for (let i = index - 1; i >= 0; i -= 1) {
      if (isVisible(questions[i], answers)) {
        setIndex(i);
        return;
      }
    }
  }

  function submit() {
    if (!answered) {
      setShowErrors(true);
      return;
    }
    const payload = questions
      .filter((q) => isVisible(q, answers))
      .map((q): AssessmentAnswer | null => {
        const answer = answers[q.id];
        if (answer) {
          if (q.responseType === 'rating') {
            const val =
              typeof answer.value === 'number' && Number.isFinite(answer.value)
                ? answer.value
                : defaultRating(q);
            return { questionId: q.id, value: val };
          }
          return answer;
        }
        // Untouched rating questions display a default value; submit it so the
        // result always reflects what the user saw.
        if (q.responseType === 'rating') {
          return { questionId: q.id, value: defaultRating(q) };
        }
        return null;
      })
      .filter((a): a is AssessmentAnswer => Boolean(a));
    onSubmit(payload);
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="info" role="status">
          {assessment.intro}
        </Alert>

        {/* Assessment Mode Depth Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Select Check-in Depth
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onModeChange?.('quick')}
              className={cn(
                'flex flex-col text-left p-3.5 rounded-xl border transition-all',
                currentMode === 'quick'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card/60 hover:border-primary/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Zap className="h-4 w-4 text-amber-400" /> Quick
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">~2-3 min</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Core pulse check. Great for busy mornings or rapid resets.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onModeChange?.('standard')}
              className={cn(
                'flex flex-col text-left p-3.5 rounded-xl border transition-all',
                currentMode === 'standard'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card/60 hover:border-primary/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Standard
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">~5-7 min</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Multi-dimensional check-in covering primary drivers and feelings.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onModeChange?.('detailed')}
              className={cn(
                'flex flex-col text-left p-3.5 rounded-xl border transition-all',
                currentMode === 'detailed'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card/60 hover:border-primary/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-purple-400" /> Detailed
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">~12-15 min</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Deep-dive across all bank questions in this dimension.
              </p>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <span>{assessment.questions.length} questions in this mode</span>
            <span aria-hidden="true">·</span>
            <span>~{assessment.estimatedMinutes} minutes</span>
          </div>
          {assessment.totalQuestions && assessment.totalQuestions > assessment.questions.length ? (
            <span className="text-xs text-muted-foreground/80">
              (Filtered from full bank of {assessment.totalQuestions} questions)
            </span>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">{assessment.disclaimer}</p>

        <Button onClick={() => setStarted(true)} size="lg" className="gap-2">
          Begin {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Check-in
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (!current) {
    return <Alert variant="warning">This assessment has no questions available for this mode.</Alert>;
  }

  const answeredNumbers = questions.slice(0, index + 1).filter((q) => isVisible(q, answers)).length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {answeredNumbers} of {visibleCount}</span>
          <span className="font-medium capitalize text-primary">{currentMode} Mode</span>
        </div>
        <Progress value={progress} label={`Question ${answeredNumbers} of ${visibleCount}`} />
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <fieldset className="space-y-4">
          <div className="space-y-1.5">
            <legend className="text-lg font-medium leading-snug">
              {current.text}
              {current.required === false ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
              ) : null}
            </legend>
            {current.soundscapeRecommendation ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                <Music className="h-3 w-3" /> Paired with calming soundscape
              </div>
            ) : null}
          </div>

          {current.helpText ? (
            <p className="text-sm text-muted-foreground">{current.helpText}</p>
          ) : null}

          {current.responseType === 'single_choice' || current.responseType === 'boolean' ? (
            <RadioGroup
              name={current.id}
              value={currentAnswer?.optionIds?.[0]}
              options={current.options.map((o) => ({
                value: o.id,
                label: o.label,
                emoji: o.emoji,
              }))}
              onChange={(value) => setAnswer(current.id, { optionIds: [value] })}
            />
          ) : null}

          {current.responseType === 'multi_choice' ? (
            <div className="space-y-2">
              {current.options.map((option) => {
                const selected = currentAnswer?.optionIds ?? [];
                const atMax =
                  current.maxSelections != null && selected.length >= current.maxSelections;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted',
                      selected.includes(option.id) && 'border-primary bg-primary/5',
                      !selected.includes(option.id) && atMax && 'opacity-60',
                    )}
                  >
                    <Checkbox
                      checked={selected.includes(option.id)}
                      disabled={!selected.includes(option.id) && atMax}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, option.id]
                          : selected.filter((id) => id !== option.id);
                        setAnswer(current.id, { optionIds: next });
                      }}
                    />
                    <span className="text-sm">
                      {option.emoji ? <span className="mr-1.5">{option.emoji}</span> : null}
                      {option.label}
                    </span>
                  </label>
                );
              })}
              {current.maxSelections ? (
                <p className="text-xs text-muted-foreground">
                  Choose up to {current.maxSelections}.
                </p>
              ) : null}
            </div>
          ) : null}

          {current.responseType === 'rating' ? (() => {
            const min = current.ratingMin ?? 1;
            const max = current.ratingMax ?? 5;
            const currentVal = effectiveRating(current, currentAnswer);
            const labelIdx = Math.min(
              Math.max(currentVal - min, 0),
              (current.ratingLabels?.length ?? 1) - 1,
            );
            const activeLabel = current.ratingLabels?.[labelIdx] ?? `Rating ${currentVal}`;
            const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

            return (
              <div className="space-y-4">
                <Slider
                  label={activeLabel}
                  min={min}
                  max={max}
                  step={1}
                  value={currentVal}
                  onValueChange={(value) => setAnswer(current.id, { value, optionIds: undefined })}
                />
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {steps.map((stepVal) => {
                    const active = currentVal === stepVal;
                    return (
                      <button
                        key={stepVal}
                        type="button"
                        onClick={() => setAnswer(current.id, { value: stepVal, optionIds: undefined })}
                        className={cn(
                          'flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center',
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                            : 'border-border/60 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/40',
                        )}
                      >
                        {stepVal}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                  <span>{current.ratingLabels?.[0] ?? min}</span>
                  <span>
                    {current.ratingLabels?.[current.ratingLabels.length - 1] ?? max}
                  </span>
                </div>
              </div>
            );
          })() : null}

          {current.responseType === 'short_text' ? (
            <div className="space-y-1.5">
              <Input
                value={currentAnswer?.text ?? ''}
                maxLength={current.maxLength ?? 300}
                onChange={(e) => setAnswer(current.id, { text: e.target.value })}
                aria-label={current.text}
              />
              <p className="text-xs text-muted-foreground">
                {(currentAnswer?.text ?? '').length}/{current.maxLength ?? 300}
              </p>
            </div>
          ) : null}

          {showErrors && !answered ? (
            <p role="alert" className="text-sm text-destructive">
              Please answer this question to continue.
            </p>
          ) : null}
        </fieldset>
      </motion.div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={back} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Button>
        {isLast ? (
          <Button onClick={submit} disabled={submitting}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Analysing…' : 'See my results'}
          </Button>
        ) : (
          <Button onClick={next}>
            Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
