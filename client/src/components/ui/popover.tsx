import * as React from 'react';
import { Popover as BasePopover } from '@base-ui-components/react';
import { cn } from '@/utils/cn';

/**
 * Anchored popover wrapper matching the project's Dialog styling. The trigger
 * is provided by the caller via `render`; the panel is rendered in a portal.
 */
export function Popover({
  trigger,
  children,
  title,
  className,
  align = 'end',
}: {
  trigger: React.ReactElement;
  children: React.ReactNode;
  title: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}): React.JSX.Element {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        render={(props) => React.cloneElement(trigger, props as Record<string, unknown>)}
      />
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={8} align={align} className="z-50">
          <BasePopover.Popup
            className={cn(
              'w-[min(22rem,92vw)] rounded-lg border border-border bg-card p-4 shadow-lg outline-none',
              className,
            )}
          >
            <p className="mb-2 text-sm font-semibold">{title}</p>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
