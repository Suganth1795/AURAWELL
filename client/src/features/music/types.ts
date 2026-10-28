export type MusicCategory =
  | 'All'
  | 'Rain'
  | 'Ocean'
  | 'Forest'
  | 'Water'
  | 'Wind'
  | 'Meditation'
  | 'Ambient Music'
  | 'Favorites';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  title: string;
  filename: string;
  src: string;
  category: Exclude<MusicCategory, 'All' | 'Favorites'>;
  mood: string;
  description: string;
  tags: string[];
  themeColor: string;
  themeGradient: string;
  duration?: number; // duration in seconds (if known or once metadata loads)
  isAvailable: boolean;
}

export interface MusicState {
  currentTrack: Track | null;
  playbackStatus: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  history: string[]; // Track IDs
  favorites: string[]; // Track IDs
  isExpanded: boolean;
  error: string | null;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  toggleFavorite: (trackId: string) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setExpanded: (expanded: boolean) => void;
}
