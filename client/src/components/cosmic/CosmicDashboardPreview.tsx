import { useState } from 'react';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Brain,
  Heart,
} from 'lucide-react';

interface DataPoint {
  day: string;
  score: number;
  energy: number;
  mood: string;
}

const DATA_POINTS: DataPoint[] = [
  { day: '14 Oct', score: 62, energy: 50, mood: 'Calm' },
  { day: '16 Oct', score: 68, energy: 58, mood: 'Focused' },
  { day: '18 Oct', score: 75, energy: 65, mood: 'Grounded' },
  { day: '20 Oct', score: 71, energy: 62, mood: 'Reflective' },
  { day: '22 Oct', score: 84, energy: 78, mood: 'Energized' },
  { day: '24 Oct', score: 79, energy: 74, mood: 'Peaceful' },
  { day: '26 Oct', score: 92, energy: 88, mood: 'Optimistic' },
];

export function CosmicDashboardPreview(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'reflections' | 'mindplay' | 'rhythms'>('overview');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(DATA_POINTS[DATA_POINTS.length - 1]);

  // SVG Chart Dimensions
  const width = 480;
  const height = 150;
  const padding = 20;

  const points = DATA_POINTS.map((d, i) => {
    const x = padding + (i / (DATA_POINTS.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.score - 40) / 60) * (height - padding * 2);
    return { x, y, data: d };
  });

  const secondaryPoints = DATA_POINTS.map((d, i) => {
    const x = padding + (i / (DATA_POINTS.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.energy - 40) / 60) * (height - padding * 2);
    return { x, y, data: d };
  });

  const pathString = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const secondaryPathString = secondaryPoints.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = secondaryPoints[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-border bg-card/85 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl text-foreground">
      {/* Top Glass Window Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-foreground tracking-wide">
              AuraWell Intelligence Engine
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
              ● Live Sync
            </span>
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border">
          {(['overview', 'reflections', 'mindplay', 'rhythms'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="space-y-6">
        {/* Welcome & Key Metrics Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold tracking-tight text-foreground">
                Welcome back, Alex
              </h4>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                Adult Mode
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your cognitive harmony index is up 14% this week. 2 gentle reflections completed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/40 px-3.5 py-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</div>
                <div className="text-sm font-bold text-foreground">14 Days</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/40 px-3.5 py-2">
              <Brain className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Resilience</div>
                <div className="text-sm font-bold text-foreground">92 / 100</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/40 px-3.5 py-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mindful XP</div>
                <div className="text-sm font-bold text-foreground">1,420</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Cards Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left Chart Card: 14-Day Wellness Frequency */}
          <div className="relative rounded-2xl border border-border bg-card/75 p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Emotional Harmony & Energy Rhythm
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Interactive multi-day reflection curve
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  Harmony
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  Vitality
                </span>
              </div>
            </div>

            {/* Glowing SVG Chart Canvas */}
            <div className="relative mt-2 h-44 w-full">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradientCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="chartStrokeCyan" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="20" y1="35" x2="460" y2="35" stroke="currentColor" className="text-border/40" strokeDasharray="4 4" />
                <line x1="20" y1="75" x2="460" y2="75" stroke="currentColor" className="text-border/40" strokeDasharray="4 4" />
                <line x1="20" y1="115" x2="460" y2="115" stroke="currentColor" className="text-border/40" strokeDasharray="4 4" />

                {/* Secondary energy curve */}
                <path
                  d={secondaryPathString}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="opacity-70"
                />

                {/* Main harmony curve */}
                <path
                  d={pathString}
                  fill="none"
                  stroke="url(#chartStrokeCyan)"
                  strokeWidth="3.5"
                  className="drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                />

                {/* Interactive Points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-background stroke-cyan-500 stroke-2 transition-transform duration-200 hover:scale-150 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(p.data)}
                    />
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip display */}
              {hoveredPoint && (
                <div className="absolute top-1 right-2 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-2.5 py-1 text-xs text-foreground backdrop-blur-md shadow-md">
                  <span className="font-semibold text-primary">{hoveredPoint.day}:</span>
                  <span>{hoveredPoint.mood}</span>
                  <span className="text-muted-foreground">({hoveredPoint.score}% harmony)</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Card: AURA Companion & Safety Vault */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/75 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">AURA AI Companion</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                &ldquo;You did well taking a pause before the afternoon meeting. Your resting heart rate smoothed noticeably.&rdquo;
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Zero-Telemetry Vault</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                All reflection entries stay encrypted in your local session. Never sold or mined for advertising.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
