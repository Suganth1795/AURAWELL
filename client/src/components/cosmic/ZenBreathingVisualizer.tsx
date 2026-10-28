import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, Sparkles } from 'lucide-react';

const PHASES = [
  { name: 'Breathe In', duration: 4000, scale: 1.35, glow: 'rgba(56, 189, 248, 0.45)' },
  { name: 'Hold', duration: 4000, scale: 1.35, glow: 'rgba(129, 140, 248, 0.5)' },
  { name: 'Breathe Out', duration: 4000, scale: 1.0, glow: 'rgba(99, 102, 241, 0.25)' },
  { name: 'Rest', duration: 2000, scale: 1.0, glow: 'rgba(99, 102, 241, 0.15)' },
];

export function ZenBreathingVisualizer(): React.JSX.Element {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const currentPhase = PHASES[phaseIndex];
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [isActive, phaseIndex]);

  const current = PHASES[phaseIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-xl shadow-lg">
      {/* Background ambient light */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full blur-3xl transition-colors duration-1000"
        style={{ background: current.glow }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-primary">
              <Wind className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Zen Breathing Pacer
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted"
            aria-label={isActive ? 'Pause breathing guide' : 'Start breathing guide'}
          >
            {isActive ? (
              <>
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>Begin</span>
              </>
            )}
          </button>
        </div>

        {/* Breathing Circle Ring Visualizer */}
        <div className="relative my-6 flex h-40 w-40 items-center justify-center">
          {/* Outer pulsating aura */}
          <motion.div
            animate={{
              scale: isActive ? current.scale * 1.15 : 1,
              opacity: isActive ? 0.7 : 0.3,
            }}
            transition={{
              duration: isActive ? current.duration / 1000 : 0.5,
              ease: 'easeInOut',
            }}
            className="absolute h-36 w-36 rounded-full"
            style={{
              background: `radial-gradient(circle, ${current.glow} 0%, transparent 70%)`,
            }}
          />

          {/* Glowing boundary ring */}
          <motion.div
            animate={{
              scale: isActive ? current.scale : 1,
              borderColor: isActive ? 'rgba(165, 180, 252, 0.6)' : 'rgba(255, 255, 255, 0.15)',
            }}
            transition={{
              duration: isActive ? current.duration / 1000 : 0.5,
              ease: 'easeInOut',
            }}
            className="absolute h-28 w-28 rounded-full border border-indigo-400/40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 shadow-[0_0_30px_rgba(99,102,241,0.35)] backdrop-blur-md"
          />

          {/* Center phase label */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {isActive ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-sm font-bold tracking-wide text-foreground">
                    {current.name}
                  </span>
                  <span className="text-[10px] text-primary/80 font-mono">
                    {Math.round(current.duration / 1000)}s
                  </span>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="mt-1 text-xs font-medium">4-4-4-2</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {isActive
            ? 'Follow the pulse softly. Inhale through your nose, exhale with release.'
            : 'Tap "Begin" to start a soothing 1-minute calming breathing rhythm.'}
        </p>
      </div>
    </div>
  );
}
