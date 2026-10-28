import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Maximize2,
  ListMusic,
} from 'lucide-react';
import { useMusicStore } from '../musicStore';
import { ArtworkVisualizer } from './ArtworkVisualizer';

function formatTime(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function NowPlayingBar(): React.JSX.Element | null {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playbackStatus = useMusicStore((s) => s.playbackStatus);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);
  const volume = useMusicStore((s) => s.volume);
  const isMuted = useMusicStore((s) => s.isMuted);
  const isShuffle = useMusicStore((s) => s.isShuffle);
  const repeatMode = useMusicStore((s) => s.repeatMode);
  const queue = useMusicStore((s) => s.queue);
  const favorites = useMusicStore((s) => s.favorites);

  const togglePlay = useMusicStore((s) => s.togglePlay);
  const nextTrack = useMusicStore((s) => s.nextTrack);
  const prevTrack = useMusicStore((s) => s.prevTrack);
  const seek = useMusicStore((s) => s.seek);
  const setVolume = useMusicStore((s) => s.setVolume);
  const toggleMute = useMusicStore((s) => s.toggleMute);
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useMusicStore((s) => s.cycleRepeatMode);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const setExpanded = useMusicStore((s) => s.setExpanded);

  // Scrubber drag state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  if (!currentTrack) return null;

  const displayTime = isScrubbing ? scrubValue : currentTime;
  const isPlaying = playbackStatus === 'playing';
  const isFav = favorites.includes(currentTrack.id);
  const effectiveDuration = duration || currentTrack.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / effectiveDuration) * 100));

  return (
    <aside
      aria-label="Now Playing Bar"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--glass-dock-border)] bg-[var(--glass-dock-bg)] shadow-[var(--glass-dock-shadow)] backdrop-blur-2xl transition-all text-foreground"
    >
      {/* Mini top scrub line for mobile */}
      <div className="relative h-1 w-full bg-border sm:hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left Section: Active Track Info & Cover */}
        <div className="flex items-center gap-3 min-w-0 max-w-[28%] sm:max-w-[30%]">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Open expanded music view"
            className="group relative shrink-0 transition-transform hover:scale-105"
          >
            <ArtworkVisualizer track={currentTrack} size="sm" isPlaying={isPlaying} />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3 w-3 text-white" />
            </div>
          </button>

          <div className="min-w-0 truncate">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="block truncate text-left text-xs font-semibold text-foreground hover:underline sm:text-sm"
            >
              {currentTrack.title}
            </button>
            <span className="block truncate text-[11px] text-muted-foreground">
              {currentTrack.mood}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack.id)}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className={`hidden sm:flex p-1.5 transition-colors hover:text-foreground ${
              isFav ? 'text-rose-500 dark:text-rose-400' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center Section: Playback Controls & Progress Timeline */}
        <div className="flex flex-1 flex-col items-center justify-center max-w-xl px-2">
          {/* Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label="Toggle shuffle"
              className={`hidden sm:flex p-1.5 transition-colors hover:text-foreground ${
                isShuffle ? 'text-cyan-500 dark:text-cyan-400' : 'text-muted-foreground'
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={prevTrack}
              aria-label="Previous track"
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              title="Previous"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next track"
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              title="Next"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={cycleRepeatMode}
              aria-label={`Cycle repeat mode: current is ${repeatMode}`}
              className={`hidden sm:flex p-1.5 transition-colors hover:text-foreground ${
                repeatMode !== 'off' ? 'text-cyan-500 dark:text-cyan-400' : 'text-muted-foreground'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Desktop Timeline Bar */}
          <div className="hidden sm:flex w-full items-center gap-2 pt-1 text-[11px] font-mono text-muted-foreground">
            <span className="w-9 text-right">{formatTime(displayTime)}</span>
            <div className="relative flex-1 py-1">
              <input
                type="range"
                min={0}
                max={effectiveDuration}
                step={0.5}
                value={displayTime}
                aria-label="Playback timeline"
                onChange={(e) => {
                  setIsScrubbing(true);
                  setScrubValue(parseFloat(e.target.value));
                }}
                onMouseUp={() => {
                  seek(scrubValue);
                  setIsScrubbing(false);
                }}
                onTouchEnd={() => {
                  seek(scrubValue);
                  setIsScrubbing(false);
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted-foreground/25 accent-primary focus:outline-none"
              />
            </div>
            <span className="w-9 text-left">{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Right Section: Volume & Expand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Queue count pill */}
          {queue.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="View queue"
              className="hidden lg:flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] text-foreground hover:bg-muted/80"
              title="Upcoming in queue"
            >
              <ListMusic className="h-3.5 w-3.5 text-primary" />
              <span>{queue.length}</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-destructive" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              aria-label="Volume slider"
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-muted-foreground/25 accent-primary focus:outline-none"
            />
          </div>

          {/* Full Expanded View Toggle */}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand player to full view"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Expand player"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
