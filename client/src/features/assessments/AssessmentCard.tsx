import { Link } from 'react-router-dom';
import { Clock, ListChecks, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { AssessmentCategory, AssessmentSummary } from './types';

export const CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  emotional: 'Emotional wellness',
  sleep: 'Sleep',
  focus: 'Focus',
  habits: 'Habits',
  activity: 'Activity',
  social: 'Connection',
  digital: 'Digital wellbeing',
  strengths: 'Strengths',
  lifestyle: 'Lifestyle',
  reflection: 'Reflection',
};

export function AssessmentCard({
  assessment,
}: {
  assessment: AssessmentSummary;
}): React.JSX.Element {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{assessment.title}</CardTitle>
          <Badge variant="secondary">{CATEGORY_LABELS[assessment.category]}</Badge>
        </div>
        <CardDescription>{assessment.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />~{assessment.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
            {assessment.questionCount} questions
          </span>
        </div>
        <Link
          to={`/assessments/${assessment.code}`}
          state={{ title: assessment.title }}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Start check-in
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
