import { Play, Pause, Heart, ListPlus, Volume2 } from 'lucide-react';
import type { Track } from '../types';
import { ArtworkVisualizer } from './ArtworkVisualizer';
import { useMusicStore } from '../musicStore';

interface MusicTrackRowProps {
  track: Track;
  index: number;
  allTracks: Track[];
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function MusicTrackRow({ track, index, allTracks }: MusicTrackRowProps): React.JSX.Element {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playbackStatus = useMusicStore((s) => s.playbackStatus);
  const playTrack = useMusicStore((s) => s.playTrack);
  const togglePlay = useMusicStore((s) => s.togglePlay);
  const favorites = useMusicStore((s) => s.favorites);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);
  const addToQueue = useMusicStore((s) => s.addToQueue);

  const isCurrent = currentTrack?.id === track.id;
  const isPlaying = isCurrent && playbackStatus === 'playing';
  const isFav = favorites.includes(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, allTracks);
    }
  };

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer select-none ${
        isCurrent
          ? 'bg-primary/15 text-primary shadow-sm dark:bg-indigo-600/20 dark:text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
          : 'text-foreground hover:bg-muted/60'
      }`}
    >
      {/* Left: Index / Play Icon & Track Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Track # or Play/Pause Button */}
        <div className="flex h-7 w-7 items-center justify-center shrink-0 text-muted-foreground">
          {isPlaying ? (
            <>
              <Volume2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400 animate-pulse group-hover:hidden" />
              <Pause className="hidden h-3.5 w-3.5 fill-current text-foreground group-hover:block" />
            </>
          ) : (
            <>
              <span className="group-hover:hidden font-mono text-[11px]">{index + 1}</span>
              <Play className="hidden h-3.5 w-3.5 fill-current text-foreground group-hover:block" />
            </>
          )}
        </div>

        {/* Thumbnail */}
        <ArtworkVisualizer track={track} size="sm" isPlaying={isPlaying} showEqualizer={false} />

        {/* Title & Mood */}
        <div className="min-w-0 pr-4">
          <div className={`truncate font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
            {track.title}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{track.mood}</div>
        </div>
      </div>

      {/* Middle: Category Pill */}
      <div className="hidden sm:block shrink-0 px-4">
        <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-[10px] text-foreground">
          {track.category}
        </span>
      </div>

      {/* Right: Favorite, Queue & Duration */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-1 transition-colors hover:text-foreground ${
            isFav ? 'text-rose-500 dark:text-rose-400' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Add to queue */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(track);
          }}
          aria-label="Add to playback queue"
          className="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
          title="Add to queue"
        >
          <ListPlus className="h-4 w-4" />
        </button>

        {/* Duration */}
        <span className="w-12 text-right font-mono text-[11px] text-muted-foreground">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
