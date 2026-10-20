import { cn } from '@/utils/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

/** Accessible progress bar built on a native <progress> element. */
export function Progress({ value, max = 100, label, className }: ProgressProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(max, value));
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label ? (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>
            {clamped}/{max}
          </span>
        </div>
      ) : null}
      <progress
        value={clamped}
        max={max}
        aria-label={label ?? 'Progress'}
        className="h-2 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"
      />
    </div>
  );
}
