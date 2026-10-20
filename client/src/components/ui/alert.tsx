import * as React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

const styles = {
  info: { cls: 'border-primary/30 bg-primary/5 text-foreground', Icon: Info },
  success: { cls: 'border-success/40 bg-success/10 text-foreground', Icon: CheckCircle2 },
  error: { cls: 'border-destructive/40 bg-destructive/10 text-foreground', Icon: AlertCircle },
  warning: { cls: 'border-warning/50 bg-warning/10 text-foreground', Icon: AlertCircle },
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof styles;
  role?: 'alert' | 'status';
}

export function Alert({
  className,
  variant = 'info',
  role = 'alert',
  children,
  ...props
}: AlertProps): React.JSX.Element {
  const { cls, Icon } = styles[variant];
  return (
    <div role={role} className={cn('flex items-start gap-2 rounded-md border p-3 text-sm', cls, className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
