import { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Play,
  Heart,
  X,
  Music,
  Waves,
} from 'lucide-react';
import { musicCatalog, MUSIC_CATEGORIES } from './musicCatalog';
import type { MusicCategory, Track } from './types';
import { MusicCard } from './components/MusicCard';
import { MusicTrackRow } from './components/MusicTrackRow';
import { useMusicStore } from './musicStore';

export function MusicPage(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const favorites = useMusicStore((s) => s.favorites);
  const history = useMusicStore((s) => s.history);
  const playTrack = useMusicStore((s) => s.playTrack);

  // Recently played tracks from IDs
  const recentTracks = useMemo(() => {
    return history
      .map((id) => musicCatalog.find((t) => t.id === id))
      .filter((t): t is Track => t !== undefined)
      .slice(0, 4);
  }, [history]);

  // Filtered tracks based on category & search query
  const filteredTracks = useMemo(() => {
    return musicCatalog.filter((track) => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(track.id)) return false;
      } else if (selectedCategory !== 'All' && track.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = track.title.toLowerCase().includes(q);
        const matchesCategory = track.category.toLowerCase().includes(q);
        const matchesMood = track.mood.toLowerCase().includes(q);
        const matchesDesc = track.description.toLowerCase().includes(q);
        const matchesTag = track.tags.some((t) => t.toLowerCase().includes(q));

        return matchesTitle || matchesCategory || matchesMood || matchesDesc || matchesTag;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, favorites]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: musicCatalog.length,
      Favorites: favorites.length,
    };
    for (const t of musicCatalog) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [favorites]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Quick Launcher */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-indigo-500/10 via-card/80 to-purple-500/10 dark:from-indigo-950/40 dark:via-slate-950/70 dark:to-slate-900/50 p-6 sm:p-8 backdrop-blur-2xl shadow-lg dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        {/* Ambient background bloom */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Music className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                AuraWell Soundscapes
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Peaceful Sounds & Nature Ambience
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Immerse your space in authentic natural soundscapes and relaxing ambient melodies.
              Calibrated to relieve stress, enhance deep focus, and support restful sleep.
            </p>
          </div>

          {/* Quick Play CTA */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                const rainTrack = musicCatalog.find((t) => t.category === 'Rain') || musicCatalog[0];
                if (rainTrack) playTrack(rainTrack, musicCatalog);
              }}
              className="glow-btn-primary flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Play Calming Rain</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const oceanTrack = musicCatalog.find((t) => t.category === 'Ocean') || musicCatalog[1];
                if (oceanTrack) playTrack(oceanTrack, musicCatalog);
              }}
              className="glow-btn-glass flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium"
            >
              <Waves className="h-4 w-4" />
              <span>Play Ocean Waves</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & View Mode Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search soundscapes, rain, forest, bells..."
            className="w-full rounded-full border border-border bg-card/80 pl-10 pr-9 py-2 text-xs text-foreground placeholder-muted-foreground backdrop-blur-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto rounded-xl border border-border bg-muted/50 p-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`rounded-lg p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`rounded-lg p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MUSIC_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] ?? 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40'
                  : 'border border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat === 'Favorites' && <Heart className="h-3 w-3 fill-current text-rose-500" />}
              <span>{cat}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recently Played Section (shown when on "All" and no search query) */}
      {selectedCategory === 'All' && !searchQuery && recentTracks.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recentTracks.map((track) => (
              <MusicCard key={`recent-${track.id}`} track={track} allTracks={musicCatalog} />
            ))}
          </div>
        </section>
      )}

      {/* Main Track Display Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {selectedCategory === 'All'
                ? 'All Soundscapes'
                : selectedCategory === 'Favorites'
                  ? 'Your Favorite Soundscapes'
                  : `${selectedCategory} Sounds`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {filteredTracks.length} {filteredTracks.length === 1 ? 'soundscape' : 'soundscapes'} available
            </p>
          </div>
        </div>

        {/* Empty States */}
        {filteredTracks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/60 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Music className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">No soundscapes found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {selectedCategory === 'Favorites'
                ? "You haven't marked any soundscapes as favorite yet. Tap the heart icon on any sound to save it here."
                : `No audio files matched "${searchQuery}" in ${selectedCategory}. Try searching for "rain", "waves", or "bell".`}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredTracks.map((track) => (
              <MusicCard key={track.id} track={track} allTracks={filteredTracks} />
            ))}
          </div>
        ) : (
          /* List / Table View */
          <div className="rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-7 text-center">#</span>
                <span>Title</span>
              </div>
              <div className="hidden sm:block px-4">Category</div>
              <div className="w-20 text-right">Time</div>
            </div>

            <div className="divide-y divide-border/40">
              {filteredTracks.map((track, idx) => (
                <MusicTrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  allTracks={filteredTracks}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
