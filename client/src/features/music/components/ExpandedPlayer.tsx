import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListMusic,
  Trash2,
  X,
} from 'lucide-react';
import { useMusicStore } from '../musicStore';
import { ArtworkVisualizer } from './ArtworkVisualizer';

function formatTime(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ExpandedPlayer(): React.JSX.Element | null {
  const isExpanded = useMusicStore((s) => s.isExpanded);
  const setExpanded = useMusicStore((s) => s.setExpanded);
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
  const seekRelative = useMusicStore((s) => s.seekRelative);
  const setVolume = useMusicStore((s) => s.setVolume);
  const toggleMute = useMusicStore((s) => s.toggleMute);
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useMusicStore((s) => s.cycleRepeatMode);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const playTrack = useMusicStore((s) => s.playTrack);
  const removeFromQueue = useMusicStore((s) => s.removeFromQueue);
  const clearQueue = useMusicStore((s) => s.clearQueue);

  const [showQueue, setShowQueue] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, setExpanded]);

  if (!isExpanded || !currentTrack) return null;

  const displayTime = isScrubbing ? scrubValue : currentTime;
  const isPlaying = playbackStatus === 'playing';
  const isFav = favorites.includes(currentTrack.id);
  const effectiveDuration = duration || currentTrack.duration || 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        {/* Dynamic Theme Backdrop with Ambient Lighting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl"
        >
          {/* Ambient color bloom */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-[140px] pointer-events-none opacity-40 transition-colors duration-1000"
            style={{ background: currentTrack.themeColor }}
          />
        </motion.div>

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex h-full w-full max-w-4xl flex-col justify-between p-4 sm:p-8 md:max-h-[92vh] overflow-y-auto"
        >
          {/* Top Bar: Collapse, Heading, Queue Toggle */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Minimize player"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
              <span>Minimize</span>
            </button>

            <div className="text-center">
              <span className="block text-[11px] uppercase tracking-widest text-slate-400">
                Playing From
              </span>
              <span className="text-xs font-semibold text-white">
                Peaceful Sounds • AuraWell AI
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQueue(!showQueue)}
              aria-label={showQueue ? 'Hide queue' : 'Show queue'}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                showQueue
                  ? 'border-indigo-400 bg-indigo-600/30 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <ListMusic className="h-4 w-4" />
              <span className="hidden sm:inline">Queue</span>
              {queue.length > 0 && (
                <span className="rounded-full bg-indigo-500 px-1.5 py-0.2 text-[10px] text-white">
                  {queue.length}
                </span>
              )}
            </button>
          </div>

          {/* Main Content: Center Artwork or Queue View */}
          <div className="my-auto py-6">
            {showQueue ? (
              /* Queue View */
              <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Playback Queue</h3>
                  {queue.length > 0 && (
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Queue</span>
                    </button>
                  )}
                </div>

                <div className="mb-3 text-xs text-slate-400">Now Playing</div>
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-indigo-600/20 p-2.5 ring-1 ring-indigo-500/30">
                  <ArtworkVisualizer track={currentTrack} size="sm" isPlaying={isPlaying} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {currentTrack.title}
                    </div>
                    <div className="text-xs text-indigo-300">{currentTrack.category}</div>
                  </div>
                </div>

                <div className="mb-2 text-xs text-slate-400">Next Up</div>
                {queue.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No upcoming tracks in queue. Tracks from the catalog will continue automatically.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {queue.map((t, idx) => (
                      <div
                        key={`${t.id}-${idx}`}
                        className="group flex items-center justify-between rounded-xl p-2 text-xs hover:bg-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const newQueue = queue.slice(idx + 1);
                            playTrack(t, newQueue);
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <ArtworkVisualizer track={t} size="sm" />
                          <div className="truncate">
                            <div className="font-medium text-white truncate">{t.title}</div>
                            <div className="text-[11px] text-slate-400">{t.mood}</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromQueue(idx)}
                          aria-label={`Remove ${t.title} from queue`}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Artwork & Track Information */
              <div className="flex flex-col items-center text-center">
                <ArtworkVisualizer
                  track={currentTrack}
                  size="xl"
                  isPlaying={isPlaying}
                  className="shadow-2xl"
                />

                <div className="mt-8 flex w-full max-w-lg items-center justify-between px-2">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {currentTrack.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-indigo-300 font-medium">
                      {currentTrack.mood} • {currentTrack.category}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentTrack.id)}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className={`rounded-full p-2.5 transition-colors ${
                      isFav
                        ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <p className="mt-3 max-w-lg text-left text-xs leading-relaxed text-slate-400 px-2">
                  {currentTrack.description}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls Area */}
          <div className="mx-auto w-full max-w-lg space-y-4">
            {/* Timeline Progress Slider */}
            <div>
              <input
                type="range"
                min={0}
                max={effectiveDuration}
                step={0.5}
                value={displayTime}
                aria-label="Expanded playback timeline"
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-cyan-400 focus:outline-none"
              />
              <div className="mt-1.5 flex justify-between font-mono text-xs text-slate-400">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(effectiveDuration)}</span>
              </div>
            </div>

            {/* Playback Button Row: Shuffle, -10s, Prev, Play/Pause, Next, +10s, Repeat */}
            <div className="flex items-center justify-between px-2">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label="Toggle shuffle"
                className={`p-2 transition-colors ${
                  isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => seekRelative(-10)}
                aria-label="Seek back 10 seconds"
                className="p-2 text-slate-400 transition-colors hover:text-white"
                title="Rewind 10s"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={prevTrack}
                aria-label="Previous track"
                className="p-2 text-slate-200 transition-colors hover:text-white"
              >
                <SkipBack className="h-6 w-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-7 w-7 fill-current ml-1" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next track"
                className="p-2 text-slate-200 transition-colors hover:text-white"
              >
                <SkipForward className="h-6 w-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => seekRelative(10)}
                aria-label="Seek forward 10 seconds"
                className="p-2 text-slate-400 transition-colors hover:text-white"
                title="Forward 10s"
              >
                <RotateCw className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={cycleRepeatMode}
                aria-label={`Cycle repeat mode: current is ${repeatMode}`}
                className={`p-2 transition-colors ${
                  repeatMode !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-5 w-5" />
                ) : (
                  <Repeat className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Volume Row */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-slate-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
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
                className="h-1.5 w-44 cursor-pointer appearance-none rounded-full bg-white/20 accent-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
