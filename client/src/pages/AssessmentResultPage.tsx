import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { assessmentsService } from '@/features/assessments/assessmentsService';
import { AssessmentResultView } from '@/features/assessments/AssessmentResultView';
import { useAsync } from '@/hooks/useAsync';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/spinner';

export function AssessmentResultPage(): React.JSX.Element {
  const { id = '' } = useParams();
  const { data: result, error, loading } = useAsync(() => assessmentsService.result(id), [id]);

  return (
    <div className="space-y-6">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to assessments
      </Link>

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading your result…" /> : null}
      {result ? <AssessmentResultView result={result} /> : null}
    </div>
  );
}
