import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Sparkles,
  Zap,
  Calendar,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { assessmentsService } from '@/features/assessments/assessmentsService';
import { AssessmentCard, CATEGORY_LABELS } from '@/features/assessments/AssessmentCard';
import type {
  AssessmentCategory,
  AssessmentHistoryItem,
  AssessmentStatsSummary,
  AssessmentSummary,
} from '@/features/assessments/types';
import { useAsync } from '@/hooks/useAsync';
import { Tabs } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export function AssessmentsPage(): React.JSX.Element {
  const [tab, setTab] = useState('catalogue');
  const { data, error, loading } = useAsync(async () => {
    const [list, past, stats] = await Promise.all([
      assessmentsService.list(),
      assessmentsService.history(1, 20),
      assessmentsService.getStatsSummary().catch(() => null),
    ]);
    return {
      assessments: list,
      history: past.items,
      stats,
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AuraAssess Question Bank"
        description="Comprehensive mental wellness check-ins powered by 540 diverse, non-diagnostic reflection questions across 15 dimensions."
      />

      {error ? <Alert variant="error">{error.message}</Alert> : null}
      {loading ? <LoadingState label="Loading wellness check-ins…" /> : null}

      {data ? (
        <div className="space-y-6">
          {/* Hero Question Bank Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> 540 Verified Questions · 15 Categories
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    <Music className="h-3 w-3 text-sky-400" /> Soundscape Integrated
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Evidence-Informed Self-Reflection
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Explore tailored check-ins with multi-depth modes (Quick ~2m, Standard ~5m, Detailed ~12m).
                  Every completed assessment yields non-diagnostic wellness indicators, an actionable 7-day plan,
                  and curated Peaceful Sounds soundscapes.
                </p>
              </div>

              {/* Quick Launch Cards */}
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <Link
                  to="/assessments/daily-mood"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'sm' }),
                    'shadow-sm gap-2',
                  )}
                >
                  <Zap className="h-4 w-4" /> Quick Daily Pulse
                </Link>
                <Link
                  to="/assessments/weekly-review"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'gap-2',
                  )}
                >
                  <Calendar className="h-4 w-4" /> Weekly Review
                </Link>
              </div>
            </div>
          </div>

          <Tabs
            value={tab}
            onValueChange={setTab}
            tabs={[
              {
                value: 'catalogue',
                label: `Catalogue (${data.assessments.length})`,
                content: <Catalogue assessments={data.assessments} stats={data.stats} />,
              },
              {
                value: 'history',
                label: `My History (${data.history.length})`,
                content: <HistoryList history={data.history} />,
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function Catalogue({
  assessments,
}: {
  assessments: AssessmentSummary[];
  stats?: AssessmentStatsSummary | null;
}): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<AssessmentCategory>();
    assessments.forEach((a) => set.add(a.category));
    return Array.from(set);
  }, [assessments]);

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      const matchesCategory =
        selectedCategory === 'all' || a.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[a.category] ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [assessments, selectedCategory, search]);

  if (assessments.length === 0) {
    return <Alert variant="info">No check-ins are available for your age group yet.</Alert>;
  }

  return (
    <div className="space-y-5">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search check-ins, feelings, or themes…"
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {assessments.length} check-ins
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const label = CATEGORY_LABELS[cat] ?? cat;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Alert variant="info">No check-ins match your search or filter.</Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((assessment) => (
            <AssessmentCard key={assessment.code} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryList({ history }: { history: AssessmentHistoryItem[] }): React.JSX.Element {
  if (history.length === 0) {
    return (
      <Alert variant="info" role="status">
        You have not completed any check-ins yet. Your results and 7-day action plans will appear here.
      </Alert>
    );
  }
  return (
    <div className="space-y-3">
      {history.map((item) => (
        <Card key={item.id} className="transition-all hover:border-primary/30">
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
            {item.hasPlan ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" /> 7-Day Plan
              </Badge>
            ) : null}
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
