import * as React from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  emoji?: string;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  legend?: string;
  describedBy?: string;
}

/** Accessible radio group built on native inputs with fieldset semantics. */
export function RadioGroup({
  name,
  value,
  options,
  onChange,
  disabled,
  className,
  legend,
  describedBy,
}: RadioGroupProps): React.JSX.Element {
  return (
    <fieldset className={cn('space-y-2', className)} aria-describedby={describedBy}>
      {legend ? <legend className="mb-2 text-sm font-medium">{legend}</legend> : null}
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted',
            value === option.value && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange?.(option.value)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
          />
          <span className="flex-1 text-sm">
            {option.emoji ? <span className="mr-1.5">{option.emoji}</span> : null}
            <span className="font-medium">{option.label}</span>
            {option.description ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
            ) : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
