import { cn } from '@/utils/cn';

export interface GalaxyDomain {
  key: string;
  label: string;
  /** 0-100 indicator value from the user's own check-in. */
  value: number;
}

function humanise(key: string): string {
  return key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * A calm, non-competitive "galaxy" of wellness domains. Each domain is a node
 * positioned around a centre; its size reflects the user's own self-reported
 * indicator, never a ranking against others. Fully described for assistive tech.
 */
export function WellnessGalaxy({
  domains,
  className,
}: {
  domains: GalaxyDomain[];
  className?: string;
}): React.JSX.Element {
  if (domains.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        Complete a check-in to grow your wellness galaxy.
      </p>
    );
  }

  const size = 260;
  const center = size / 2;
  const radius = size / 2 - 40;

  const description = domains
    .map((d) => `${d.label}: ${Math.round(d.value)} out of 100`)
    .join(', ');

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Wellness galaxy. ${description}`}
        className="h-64 w-64"
      >
        <defs>
          <radialGradient id="galaxy-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius + 24} fill="url(#galaxy-core)" className="text-primary" />
        <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 6" className="text-primary" />
        <circle cx={center} cy={center} r={radius * 0.55} fill="none" stroke="currentColor" strokeOpacity="0.1" className="text-primary" />

        <circle cx={center} cy={center} r={16} className="fill-primary/20" />

        {domains.map((domain, index) => {
          const angle = (index / domains.length) * Math.PI * 2 - Math.PI / 2;
          const nodeRadius = 6 + (Math.max(0, Math.min(100, domain.value)) / 100) * 14;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <g key={domain.key}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-primary"
              />
              <circle cx={x} cy={y} r={nodeRadius} className="fill-primary" fillOpacity={0.55} />
            </g>
          );
        })}
      </svg>

      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {domains.map((domain) => (
          <li key={domain.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            {humanise(domain.key)}
            <span className="text-foreground">{Math.round(domain.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
