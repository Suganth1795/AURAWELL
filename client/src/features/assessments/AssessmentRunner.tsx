import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/utils/cn';
import type { AssessmentAnswer, AssessmentDetail, AssessmentQuestion } from './types';

interface RunnerProps {
  assessment: AssessmentDetail;
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

function isAnswered(question: AssessmentQuestion, answer?: AssessmentAnswer): boolean {
  if (!answer) return question.required === false;
  switch (question.responseType) {
    case 'rating':
      return answer.value !== undefined;
    case 'short_text':
      return question.required === false || (answer.text ?? '').trim().length > 0;
    default:
      return (answer.optionIds?.length ?? 0) > 0 || question.required === false;
  }
}

export function AssessmentRunner({
  assessment,
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
    () => questions.filter((q) => answers[q.id] && isAnswered(q, answers[q.id])).length,
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
      .map((q) => answers[q.id])
      .filter((a): a is AssessmentAnswer => Boolean(a));
    onSubmit(payload);
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Alert variant="info" role="status">
          {assessment.intro}
        </Alert>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{assessment.questions.length} questions</span>
          <span aria-hidden="true">·</span>
          <span>~{assessment.estimatedMinutes} minutes</span>
        </div>
        <p className="text-sm text-muted-foreground">{assessment.disclaimer}</p>
        <Button onClick={() => setStarted(true)} size="lg">
          Begin
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (!current) {
    return <Alert variant="warning">This assessment has no questions available.</Alert>;
  }

  const answeredNumbers = questions
    .slice(0, index + 1)
    .filter((q) => isVisible(q, answers)).length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Progress
        value={progress}
        label={`Question ${answeredNumbers} of about ${visibleCount}`}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium">
              {current.text}
              {current.required === false ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
              ) : null}
            </legend>
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

            {current.responseType === 'rating' ? (
              <div className="space-y-3">
                <Slider
                  label={
                    current.ratingLabels?.[
                      Math.min(
                        Math.max(
                          (currentAnswer?.value ?? current.ratingMin ?? 1) - (current.ratingMin ?? 1),
                          0,
                        ),
                        (current.ratingLabels?.length ?? 1) - 1,
                      )
                    ] ?? 'Your rating'
                  }
                  min={current.ratingMin ?? 1}
                  max={current.ratingMax ?? 5}
                  step={1}
                  value={
                    currentAnswer?.value ??
                    Math.ceil(((current.ratingMin ?? 1) + (current.ratingMax ?? 5)) / 2)
                  }
                  onValueChange={(value) => setAnswer(current.id, { value, optionIds: undefined })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{current.ratingLabels?.[0] ?? current.ratingMin}</span>
                  <span>
                    {current.ratingLabels?.[current.ratingLabels.length - 1] ?? current.ratingMax}
                  </span>
                </div>
              </div>
            ) : null}

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
