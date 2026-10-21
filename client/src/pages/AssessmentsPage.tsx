import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { assessmentsService } from '@/features/assessments/assessmentsService';
import { AssessmentCard } from '@/features/assessments/AssessmentCard';
import type { AssessmentHistoryItem, AssessmentSummary } from '@/features/assessments/types';
import { useAsync } from '@/hooks/useAsync';
import { Tabs } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/utils/cn';

export function AssessmentsPage(): React.JSX.Element {
  const [tab, setTab] = useState('catalogue');
  const { data, error, loading } = useAsync(async () => {
    const [list, past] = await Promise.all([
      assessmentsService.list(),
      assessmentsService.history(1, 20),
    ]);
    return { assessments: list, history: past.items };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AuraAssess"
        description="Short wellness reflection check-ins with clear, non-diagnostic results and next steps."
      />

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading check-ins…" /> : null}

      {data ? (
        <Tabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: 'catalogue',
              label: 'Available check-ins',
              content: <Catalogue assessments={data.assessments} />,
            },
            {
              value: 'history',
              label: 'My history',
              content: <HistoryList history={data.history} />,
            },
          ]}
        />
      ) : null}
    </div>
  );
}

function Catalogue({ assessments }: { assessments: AssessmentSummary[] }): React.JSX.Element {
  if (assessments.length === 0) {
    return <Alert variant="info">No check-ins are available for your age group yet.</Alert>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <AssessmentCard key={assessment.code} assessment={assessment} />
      ))}
    </div>
  );
}

function HistoryList({ history }: { history: AssessmentHistoryItem[] }): React.JSX.Element {
  if (history.length === 0) {
    return (
      <Alert variant="info" role="status">
        You have not completed any check-ins yet. Your results will appear here.
      </Alert>
    );
  }
  return (
    <div className="space-y-3">
      {history.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base capitalize">
                {item.assessmentCode.replace(/-/g, ' ')}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {new Date(item.completedAt).toLocaleDateString()}
              </span>
            </div>
            <CardDescription className="line-clamp-2">{item.summary}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            {item.priorities.slice(0, 3).map((priority) => (
              <Badge key={priority} variant="secondary">
                {priority}
              </Badge>
            ))}
            {item.hasPlan ? <Badge variant="outline">7-day plan</Badge> : null}
            <Link
              to={`/assessments/results/${item.id}`}
              className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'ml-auto')}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" /> View result
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
