import { Play, Pause, Heart, Sparkles } from 'lucide-react';
import type { Track } from '../types';
import { ArtworkVisualizer } from './ArtworkVisualizer';
import { useMusicStore } from '../musicStore';

interface MusicCardProps {
  track: Track;
  allTracks: Track[];
}

export function MusicCard({ track, allTracks }: MusicCardProps): React.JSX.Element {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const playbackStatus = useMusicStore((s) => s.playbackStatus);
  const playTrack = useMusicStore((s) => s.playTrack);
  const togglePlay = useMusicStore((s) => s.togglePlay);
  const favorites = useMusicStore((s) => s.favorites);
  const toggleFavorite = useMusicStore((s) => s.toggleFavorite);

  const isCurrent = currentTrack?.id === track.id;
  const isPlaying = isCurrent && playbackStatus === 'playing';
  const isFav = favorites.includes(track.id);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, allTracks);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
        isCurrent
          ? 'border-primary/50 bg-primary/10 shadow-[0_12px_36px_rgba(99,102,241,0.25)]'
          : 'border-border bg-card/75 hover:-translate-y-1 hover:border-border hover:bg-card hover:shadow-lg'
      }`}
    >
      {/* Artwork Container with floating Spotify-style play button */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        <ArtworkVisualizer
          track={track}
          size="lg"
          isPlaying={isPlaying}
          className="h-full w-full"
        />

        {/* Favorite button top right */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`}
          className={`absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isFav
              ? 'bg-rose-500/20 text-rose-500 opacity-100 ring-1 ring-rose-400/40'
              : 'bg-background/60 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Spotify-style Floating Action Play/Pause Button */}
        <div
          className={`absolute right-3 bottom-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-105 hover:brightness-110 ${
            isPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </div>
      </div>

      {/* Track Title & Details */}
      <div className="mt-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h4
              className={`truncate text-sm font-semibold tracking-tight transition-colors ${
                isCurrent ? 'text-primary' : 'text-foreground group-hover:text-primary'
              }`}
            >
              {track.title}
            </h4>
            {isCurrent && (
              <span className="shrink-0 text-primary">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {track.description}
          </p>
        </div>

        {/* Mood & Category tag footer */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
          <span className="truncate text-foreground/85 font-medium">{track.mood}</span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase font-mono text-muted-foreground border border-border/40">
            {track.category}
          </span>
        </div>
      </div>
    </div>
  );
}
