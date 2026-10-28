import { motion } from 'motion/react';
import type { Track, MusicCategory } from '../types';
import {
  CloudRain,
  Waves,
  Trees,
  Droplets,
  Wind,
  Bell,
  Sparkles,
  Music,
} from 'lucide-react';

interface ArtworkVisualizerProps {
  track: Track;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  className?: string;
  showEqualizer?: boolean;
}

const CATEGORY_ICONS: Record<Exclude<MusicCategory, 'All' | 'Favorites'>, React.ComponentType<{ className?: string }>> = {
  Rain: CloudRain,
  Ocean: Waves,
  Forest: Trees,
  Water: Droplets,
  Wind: Wind,
  Meditation: Bell,
  'Ambient Music': Music,
};

export function ArtworkVisualizer({
  track,
  size = 'md',
  isPlaying = false,
  className = '',
  showEqualizer = true,
}: ArtworkVisualizerProps): React.JSX.Element {
  const Icon = CATEGORY_ICONS[track.category] ?? Sparkles;

  const sizeClasses = {
    sm: 'h-10 w-10 rounded-lg text-sm',
    md: 'h-14 w-14 rounded-xl text-base',
    lg: 'h-48 w-48 rounded-2xl text-2xl',
    xl: 'h-72 w-72 sm:h-80 sm:w-80 rounded-3xl text-4xl',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shadow-lg select-none bg-gradient-to-br ${track.themeGradient} ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: isPlaying ? `0 12px 36px -4px ${track.themeColor}55` : undefined,
      }}
    >
      {/* Ambient glowing radial overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${track.themeColor}, transparent 70%)`,
        }}
      />

      {/* Atmospheric Background Geometry */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle cx="20" cy="20" r="35" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="85" cy="80" r="45" fill="none" stroke="white" strokeWidth="0.8" />
        <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>

      {/* Central Thematic Icon with subtle breathe motion when playing */}
      <motion.div
        animate={
          isPlaying && (size === 'lg' || size === 'xl')
            ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
      >
        <Icon className={iconSizes[size]} />
      </motion.div>

      {/* Floating Category Badge for Large sizes */}
      {(size === 'lg' || size === 'xl') && (
        <div className="absolute top-3 left-3 z-10 rounded-full border border-white/20 bg-slate-950/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {track.category}
        </div>
      )}

      {/* Audio Reactive Mini Equalizer Bars */}
      {showEqualizer && isPlaying && (
        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-end gap-1 rounded-md bg-black/50 px-1.5 py-1 backdrop-blur-md">
          {[
            { initial: 6, peak: 14 },
            { initial: 12, peak: 16 },
            { initial: 4, peak: 10 },
            { initial: 10, peak: 15 },
          ].map((bar, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-cyan-400"
              animate={{
                height: [
                  `${bar.initial}px`,
                  `${bar.peak}px`,
                  `${bar.initial}px`,
                ],
              }}
              transition={{
                duration: 0.5 + i * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ minHeight: '3px', maxHeight: '16px' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
