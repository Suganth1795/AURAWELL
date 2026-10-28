import type { Track, MusicCategory } from './types';

// Discover all audio assets in client/src/music/ via Vite
const audioModules = import.meta.glob<string>('../../music/*.{mp3,wav,ogg,m4a,aac,flac}', {
  eager: true,
  import: 'default',
});

interface TrackMetadataConfig {
  id: string;
  title: string;
  category: Exclude<MusicCategory, 'All' | 'Favorites'>;
  mood: string;
  description: string;
  tags: string[];
  themeColor: string;
  themeGradient: string;
  duration?: number;
}

const METADATA_MAP: Record<string, TrackMetadataConfig> = {
  'alexzavesa-strong-wind-1-463603.mp3': {
    id: 'strong-mountain-wind',
    title: 'Strong Mountain Wind',
    category: 'Wind',
    mood: 'Exhilarating Clarity',
    description: 'Crisp, powerful high-altitude winds cleansing the mind of mental fog.',
    tags: ['wind', 'mountain', 'air', 'breath', 'clearing'],
    themeColor: '#64748b',
    themeGradient: 'from-slate-700 via-slate-800 to-slate-950',
    duration: 56,
  },
  'audioatlant-new-world-inspiring-epic-cinematic-music-short-1-510550.mp3': {
    id: 'inspiring-horizons',
    title: 'Inspiring Horizons',
    category: 'Ambient Music',
    mood: 'Uplifting Hope',
    description: 'Expansive orchestral progression instilling hope, motivation, and forward momentum.',
    tags: ['inspiring', 'uplifting', 'cinematic', 'hope', 'motivation'],
    themeColor: '#3b82f6',
    themeGradient: 'from-blue-600 via-indigo-700 to-slate-950',
    duration: 72,
  },
  'audioatlant-total-war-epic-action-cinematic-trailer-version-2-513669.mp3': {
    id: 'focus-and-momentum',
    title: 'Focus & Momentum',
    category: 'Ambient Music',
    mood: 'Active Energy',
    description: 'Dynamic cinematic rhythm suited for active physical exercises and focused drive.',
    tags: ['dynamic', 'energy', 'momentum', 'activity', 'drive'],
    themeColor: '#f43f5e',
    themeGradient: 'from-rose-600 via-purple-700 to-slate-950',
    duration: 88,
  },
  'diamond_tunes-cinematic-sound-effect-327618.mp3': {
    id: 'cosmic-resonance',
    title: 'Cosmic Resonance',
    category: 'Meditation',
    mood: 'Expansive Awe',
    description: 'Ambient interstellar tone swells inspiring wonder and expansive perspective.',
    tags: ['ambient', 'cosmic', 'space', 'cinematic', 'meditation'],
    themeColor: '#8b5cf6',
    themeGradient: 'from-purple-600 via-violet-800 to-slate-950',
    duration: 21,
  },
  'dragon-studio-soothing-ocean-waves-372489.mp3': {
    id: 'soothing-ocean-waves',
    title: 'Soothing Ocean Waves',
    category: 'Ocean',
    mood: 'Rhythmic Relaxation',
    description: 'Gentle rhythmic surf breaking on the shore, aligning your breath with the tide.',
    tags: ['ocean', 'waves', 'water', 'tide', 'breathing'],
    themeColor: '#06b6d4',
    themeGradient: 'from-cyan-600 via-teal-700 to-slate-950',
    duration: 176,
  },
  'dragon-studio-winter-wind-402331.mp3': {
    id: 'winter-whispering-wind',
    title: 'Winter Whispering Wind',
    category: 'Wind',
    mood: 'Stillness & Introspection',
    description: 'Soft, serene chilly breeze swirling through quiet snowy branches.',
    tags: ['wind', 'winter', 'gentle', 'stillness', 'chill'],
    themeColor: '#94a3b8',
    themeGradient: 'from-slate-500 via-slate-700 to-slate-950',
    duration: 38,
  },
  'freesound_community-natural-armonics-at-136-25159.mp3': {
    id: 'natural-harmonics-136hz',
    title: 'Harmonic Resonance (136 Hz)',
    category: 'Meditation',
    mood: 'Inner Balance',
    description: 'Grounding earth frequency tone designed to harmonize nervous system equilibrium.',
    tags: ['harmonics', '136hz', 'meditation', 'frequency', 'healing'],
    themeColor: '#d97706',
    themeGradient: 'from-amber-600 via-orange-700 to-slate-950',
    duration: 64,
  },
  'freesound_community-singing-bell-hit-2-75258.mp3': {
    id: 'tibetan-singing-bell',
    title: 'Tibetan Singing Bell',
    category: 'Meditation',
    mood: 'Mindful Reset',
    description: 'A resonant brass singing bowl strike with long harmonic decay for meditation.',
    tags: ['bell', 'meditation', 'chime', 'mindfulness', 'sound bath'],
    themeColor: '#eab308',
    themeGradient: 'from-yellow-600 via-amber-700 to-slate-950',
    duration: 43,
  },
  'grand_project-uplifting-motivational-background-music-positive-vibe_18sec-496508.mp3': {
    id: 'positive-radiance',
    title: 'Positive Radiance',
    category: 'Ambient Music',
    mood: 'Bright & Optimistic',
    description: 'Warm acoustic strumming bringing lighthearted cheer to your daily routine.',
    tags: ['positive', 'uplifting', 'acoustic', 'joy', 'sunshine'],
    themeColor: '#f59e0b',
    themeGradient: 'from-amber-500 via-orange-600 to-slate-950',
    duration: 18,
  },
  'liecio-calming-rain-257596.mp3': {
    id: 'calming-rain',
    title: 'Calming Rain',
    category: 'Rain',
    mood: 'Deep Calm & Sleep',
    description: 'Gentle raindrops drumming softly, releasing tension and quieting busy thoughts.',
    tags: ['rain', 'sleep', 'focus', 'gentle', 'nature'],
    themeColor: '#3b82f6',
    themeGradient: 'from-blue-600 via-indigo-800 to-slate-950',
    duration: 144,
  },
  'maksym_dudchyk-sandy-vibe-summer-background-tropical-house-for-video-stories-26-sec-471387.mp3': {
    id: 'summer-breeze',
    title: 'Summer Breeze',
    category: 'Ambient Music',
    mood: 'Tropical Ease',
    description: 'Laid-back mellow beats evoking warm beaches and gentle sunshine.',
    tags: ['summer', 'tropical', 'mellow', 'beats', 'relaxed'],
    themeColor: '#14b8a6',
    themeGradient: 'from-teal-600 via-cyan-700 to-slate-950',
    duration: 26,
  },
  'ncprime-cinematic-background-293547.mp3': {
    id: 'ambient-reflection',
    title: 'Ambient Reflection',
    category: 'Ambient Music',
    mood: 'Focused Flow',
    description: 'Subtle textured synth pad harmonics providing an unobtrusive backdrop for focus.',
    tags: ['ambient', 'reflection', 'focus', 'flow', 'minimalist'],
    themeColor: '#4f46e5',
    themeGradient: 'from-indigo-600 via-blue-800 to-slate-950',
    duration: 24,
  },
  'openmindaudio-good-vibes-podcast-introoutro-warm-positive-closing-theme-469100.mp3': {
    id: 'good-vibes-warmth',
    title: 'Good Vibes & Warmth',
    category: 'Ambient Music',
    mood: 'Comfort & Harmony',
    description: 'Heartwarming musical theme designed to close your day with gratitude.',
    tags: ['good vibes', 'warmth', 'gratitude', 'comfort', 'closing'],
    themeColor: '#f97316',
    themeGradient: 'from-orange-600 via-amber-700 to-slate-950',
    duration: 82,
  },
  'patolenin-natural-sound-of-cow-mooing-in-urban-pasture-367828.mp3': {
    id: 'pastoral-meadow',
    title: 'Pastoral Meadow',
    category: 'Forest',
    mood: 'Rural Simplicity',
    description: 'Warm open pasture ambiance with gentle rural breeze and countryside sounds.',
    tags: ['pastoral', 'meadow', 'countryside', 'nature', 'animals'],
    themeColor: '#84cc16',
    themeGradient: 'from-lime-600 via-emerald-700 to-slate-950',
    duration: 22,
  },
  'soundreality-birds-forest-nature-445379.mp3': {
    id: 'morning-forest-sanctuary',
    title: 'Morning Forest Sanctuary',
    category: 'Forest',
    mood: 'Morning Vitality',
    description: 'Cheerful morning songbirds chirping amidst a dewy woodland awakening.',
    tags: ['birds', 'forest', 'morning', 'vitality', 'nature'],
    themeColor: '#10b981',
    themeGradient: 'from-emerald-600 via-teal-700 to-slate-950',
    duration: 145,
  },
  'soundreality-cinematic-music-487645.mp3': {
    id: 'cinematic-serenity',
    title: 'Cinematic Serenity',
    category: 'Ambient Music',
    mood: 'Deep Reflection',
    description: 'Atmospheric acoustic soundscape weaving gentle warmth and contemplative melody.',
    tags: ['ambient', 'cinematic', 'serenity', 'piano', 'calm'],
    themeColor: '#a855f7',
    themeGradient: 'from-purple-600 via-pink-700 to-slate-950',
    duration: 61,
  },
  'soundreality-nature-forest-sound-537925.mp3': {
    id: 'deep-forest-canopy',
    title: 'Deep Forest Canopy',
    category: 'Forest',
    mood: 'Forest Bathing',
    description: 'Immersive whispering leaves, distant woodland rustling, and tranquil stillness.',
    tags: ['forest', 'canopy', 'shinrin-yoku', 'peaceful', 'trees'],
    themeColor: '#059669',
    themeGradient: 'from-emerald-700 via-teal-800 to-slate-950',
    duration: 402,
  },
  'soundreality-thunder-sound-375727.mp3': {
    id: 'rolling-thunder-rain',
    title: 'Rolling Thunder & Rain',
    category: 'Rain',
    mood: 'Cozy Grounding',
    description: 'Distant rumbling thunder and steady showers for deep grounding and restful sleep.',
    tags: ['thunder', 'rain', 'cozy', 'night', 'grounding'],
    themeColor: '#6366f1',
    themeGradient: 'from-indigo-600 via-violet-800 to-slate-950',
    duration: 96,
  },
  'tramp963-waterfall-sounds-259625.mp3': {
    id: 'mountain-waterfall',
    title: 'Mountain Waterfall',
    category: 'Water',
    mood: 'Clarity & Energy',
    description: 'Crisp cascading freshwater falling over mossy granite stones.',
    tags: ['waterfall', 'water', 'nature', 'refreshing', 'focus'],
    themeColor: '#0ea5e9',
    themeGradient: 'from-sky-600 via-cyan-700 to-slate-950',
    duration: 109,
  },
};

/** Formats a raw filename into a human-readable title fallback */
function titleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const clean = withoutExt.replace(/[-_]/g, ' ').replace(/\d+/g, '').trim();
  return clean
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Build the catalogue by matching discovered Vite files with metadata
export function buildCatalog(): Track[] {
  const tracks: Track[] = [];

  for (const [pathKey, audioUrl] of Object.entries(audioModules)) {
    const filename = pathKey.split('/').pop() ?? '';
    const meta = METADATA_MAP[filename];

    if (meta) {
      tracks.push({
        id: meta.id,
        title: meta.title,
        filename,
        src: audioUrl,
        category: meta.category,
        mood: meta.mood,
        description: meta.description,
        tags: meta.tags,
        themeColor: meta.themeColor,
        themeGradient: meta.themeGradient,
        duration: meta.duration,
        isAvailable: true,
      });
    } else if (filename) {
      // Fallback for any unexpected audio file
      tracks.push({
        id: filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        title: titleFromFilename(filename),
        filename,
        src: audioUrl,
        category: 'Ambient Music',
        mood: 'Peaceful Ambience',
        description: 'Ambient soundscape for mindful reflection.',
        tags: ['ambient', 'relax'],
        themeColor: '#6366f1',
        themeGradient: 'from-indigo-600 to-slate-950',
        isAvailable: true,
      });
    }
  }

  // Stable sort: Rain, Ocean, Forest, Water, Wind, Meditation, Ambient
  const categoryOrder: Record<string, number> = {
    Rain: 1,
    Ocean: 2,
    Forest: 3,
    Water: 4,
    Wind: 5,
    Meditation: 6,
    'Ambient Music': 7,
  };

  return tracks.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
    if (catDiff !== 0) return catDiff;
    return a.title.localeCompare(b.title);
  });
}

export const musicCatalog = buildCatalog();

export const MUSIC_CATEGORIES: MusicCategory[] = [
  'All',
  'Rain',
  'Ocean',
  'Forest',
  'Water',
  'Wind',
  'Meditation',
  'Ambient Music',
  'Favorites',
];
