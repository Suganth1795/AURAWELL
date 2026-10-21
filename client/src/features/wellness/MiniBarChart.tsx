import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BarDatum {
  label: string;
  /** Normalised 0-1 height, or null for a gap. */
  value: number | null;
  caption?: string;
}

/**
 * Accessible, dependency-free bar chart. Values are described via `aria-label`
 * text and each bar exposes its value to assistive tech.
 */
export function MiniBarChart({
  data,
  height = 120,
  className,
  ariaLabel,
  emptyLabel = 'No data yet',
}: {
  data: BarDatum[];
  height?: number;
  className?: string;
  ariaLabel: string;
  emptyLabel?: string;
}): React.JSX.Element {
  const hasValues = data.some((d) => d.value !== null);
  if (!hasValues) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{emptyLabel}</p>;
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('flex items-end gap-0.5 sm:gap-1', className)}
      style={{ height }}
    >
      {data.map((datum) => (
        <div
          key={datum.label}
          className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
        >
          <div
            className={cn(
              'w-full rounded-t bg-primary/70',
              datum.value === null && 'bg-muted',
            )}
            style={{ height: `${Math.round((datum.value ?? 0) * 100)}%`, minHeight: datum.value === null ? 2 : 4 }}
            title={datum.caption}
          />
          <span
            className="w-full overflow-hidden text-center text-[10px] leading-none text-muted-foreground"
            aria-hidden="true"
          >
            {datum.label}
          </span>
        </div>
      ))}
    </div>
  );
}
