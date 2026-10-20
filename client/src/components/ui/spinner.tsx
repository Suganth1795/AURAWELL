import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }: { className?: string }): React.JSX.Element {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-2 p-8 text-muted-foreground', className)}>
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}
