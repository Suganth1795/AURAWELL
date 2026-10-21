import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui-components/react';
import { cn } from '@/utils/cn';

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}): React.JSX.Element {
  return (
    <BaseSlider.Root
      value={[value]}
      onValueChange={(next) => onValueChange(Number(next[0]))}
      min={min}
      max={max}
      step={step}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <BaseSlider.Value className="tabular-nums text-muted-foreground" />
      </div>
      <BaseSlider.Control className="flex h-6 w-full items-center">
        <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-muted">
          <BaseSlider.Indicator className="absolute rounded-full bg-primary" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          aria-label={label}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-card shadow focus-visible:outline-2 focus-visible:outline-ring"
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
