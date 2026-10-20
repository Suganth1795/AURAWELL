import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex items-start gap-2">
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-input bg-card checked:border-primary checked:bg-primary"
            {...props}
          />
          <Check
            className="pointer-events-none absolute h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
            aria-hidden="true"
          />
        </span>
        {label !== undefined ? (
          <label htmlFor={inputId} className={cn('cursor-pointer text-sm leading-5', className)}>
            {label}
            {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
          </label>
        ) : null}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
