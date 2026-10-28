import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui-components/react';
import { cn } from '@/utils/cn';

export function Slider({
  value,
  onValueChange,
  onCommittedChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  onCommittedChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}): React.JSX.Element {
  return (
    <BaseSlider.Root
      value={value}
      onValueChange={(next) => {
        const val = Array.isArray(next) ? Number(next[0]) : Number(next);
        if (Number.isFinite(val)) {
          onValueChange(val);
        }
      }}
      onValueCommitted={(next) => {
        if (!onCommittedChange) return;
        const val = Array.isArray(next) ? Number(next[0]) : Number(next);
        if (Number.isFinite(val)) {
          onCommittedChange(val);
        }
      }}
      min={min}
      max={max}
      step={step}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <BaseSlider.Value className="tabular-nums text-muted-foreground font-semibold" />
      </div>
      <BaseSlider.Control className="relative flex h-8 w-full items-center cursor-pointer touch-none select-none">
        <BaseSlider.Track className="relative h-2 w-full rounded-full bg-muted">
          <BaseSlider.Indicator className="rounded-full bg-primary h-full" />
          <BaseSlider.Thumb
            aria-label={label}
            className="block h-5 w-5 rounded-full border-2 border-primary bg-card shadow-[var(--shadow-card)] transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring cursor-grab active:cursor-grabbing"
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
