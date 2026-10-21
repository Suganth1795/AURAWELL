import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { assessmentsService } from '@/features/assessments/assessmentsService';
import { PageHeader } from '@/components/layout/PageHeader';
import { AssessmentRunner } from '@/features/assessments/AssessmentRunner';
import type { AssessmentAnswer } from '@/features/assessments/types';
import { useAsync } from '@/hooks/useAsync';
import { ApiError } from '@/services/api';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/spinner';

export function AssessmentRunnerPage(): React.JSX.Element {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: assessment, error: loadError, loading } = useAsync(
    () => assessmentsService.get(code),
    [code],
  );

  function loadErrorMessage(): string | null {
    if (!loadError) return null;
    if (loadError instanceof ApiError && loadError.status === 403) {
      return 'This check-in is not available for your age group.';
    }
    if (loadError instanceof ApiError && loadError.status === 404) {
      return 'This check-in could not be found.';
    }
    return loadError.message;
  }

  async function handleSubmit(answers: AssessmentAnswer[]) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await assessmentsService.submit(code, answers);
      navigate(`/assessments/results/${result.id}`, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'assessment_validation') {
        setError('Some answers need attention. Please review your responses.');
      } else {
        setError(e instanceof Error ? e.message : 'Could not submit your answers');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const message = loadErrorMessage();

  return (
    <div className="space-y-6">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to assessments
      </Link>

      {message ? <Alert variant="error">{message}</Alert> : null}
      {loading ? <LoadingState label="Preparing your check-in…" /> : null}

      {assessment ? (
        <div className="space-y-4">
          <PageHeader title={assessment.title} />
          <AssessmentRunner
            assessment={assessment}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </div>
  );
}
