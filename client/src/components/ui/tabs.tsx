import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui-components/react';
import { cn } from '@/utils/cn';

export function Tabs({
  value,
  onValueChange,
  tabs,
  className,
  panelClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string; content: React.ReactNode }[];
  className?: string;
  panelClassName?: string;
}): React.JSX.Element {
  return (
    <BaseTabs.Root
      value={value}
      onValueChange={(next) => onValueChange(String(next))}
      className={cn('w-full', className)}
    >
      <BaseTabs.List
        className={cn(
          'relative flex gap-1 overflow-x-auto rounded-md bg-muted p-1',
        )}
      >
        {tabs.map((tab) => (
          <BaseTabs.Tab
            key={tab.value}
            value={tab.value}
            className="z-[1] whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors data-[selected]:text-foreground"
          >
            {tab.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="absolute bottom-1 left-0 top-1 rounded bg-card shadow-sm transition-transform duration-200" />
      </BaseTabs.List>
      {tabs.map((tab) => (
        <BaseTabs.Panel key={tab.value} value={tab.value} className={cn('mt-4', panelClassName)}>
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
