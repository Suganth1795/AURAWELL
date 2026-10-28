import { create } from 'zustand';
import type { MusicState, Track, RepeatMode } from './types';
import { musicCatalog } from './musicCatalog';

const FAVORITES_STORAGE_KEY = 'aurawell-music-favorites';
const RECENT_STORAGE_KEY = 'aurawell-music-recent';
const VOLUME_STORAGE_KEY = 'aurawell-music-volume';

function readStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(musicCatalog.map((t) => t.id));
    return parsed.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}

function readStoredRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(musicCatalog.map((t) => t.id));
    return parsed.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}

function readStoredVolume(): number {
  if (typeof window === 'undefined') return 0.8;
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (!raw) return 0.8;
    const num = parseFloat(raw);
    return isNaN(num) ? 0.8 : Math.max(0, Math.min(1, num));
  } catch {
    return 0.8;
  }
}

// Global persistent HTMLAudioElement instance
let globalAudio: HTMLAudioElement | null = null;

function getAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'metadata';
  }
  return globalAudio;
}

export const useMusicStore = create<MusicState>((set, get) => {
  const initialVolume = readStoredVolume();
  const initialFavorites = readStoredFavorites();
  const initialRecent = readStoredRecent();

  const audio = getAudioElement();
  if (audio) {
    audio.volume = initialVolume;

    // Attach listeners once
    audio.addEventListener('play', () => {
      set({ playbackStatus: 'playing' });
    });

    audio.addEventListener('pause', () => {
      // If paused naturally and not errored
      if (get().playbackStatus !== 'loading') {
        set({ playbackStatus: 'paused' });
      }
    });

    audio.addEventListener('waiting', () => {
      set({ playbackStatus: 'loading' });
    });

    audio.addEventListener('canplay', () => {
      if (audio.paused) {
        set({ playbackStatus: 'paused' });
      } else {
        set({ playbackStatus: 'playing' });
      }
    });

    audio.addEventListener('timeupdate', () => {
      set({ currentTime: audio.currentTime });
    });

    audio.addEventListener('durationchange', () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        set({ duration: audio.duration });
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        set({ duration: audio.duration });
      }
    });

    audio.addEventListener('ended', () => {
      const { repeatMode, nextTrack } = get();
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    });

    audio.addEventListener('error', () => {
      set({ playbackStatus: 'error', error: 'Unable to stream audio track.' });
    });
  }

  return {
    currentTrack: null,
    playbackStatus: 'idle',
    currentTime: 0,
    duration: 0,
    volume: initialVolume,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'off',
    queue: [],
    history: initialRecent,
    favorites: initialFavorites,
    isExpanded: false,
    error: null,

    playTrack: (track: Track, newQueue?: Track[]) => {
      const audio = getAudioElement();
      if (!audio) return;

      const state = get();
      const isSameTrack = state.currentTrack?.id === track.id;

      if (isSameTrack && state.playbackStatus === 'paused') {
        void audio.play().catch((err) => {
          set({ playbackStatus: 'error', error: err?.message || 'Playback blocked' });
        });
        return;
      }

      // Update history & persist
      const newHistory = [track.id, ...state.history.filter((id) => id !== track.id)].slice(0, 30);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(newHistory));
        } catch {
          // Ignore storage errors in private browsing
        }
      }

      // Setup queue if provided
      let currentQueue = state.queue;
      if (newQueue) {
        currentQueue = newQueue.filter((t) => t.id !== track.id);
      }

      set({
        currentTrack: track,
        playbackStatus: 'loading',
        currentTime: 0,
        duration: track.duration || 0,
        error: null,
        history: newHistory,
        queue: currentQueue,
      });

      audio.src = track.src;
      audio.currentTime = 0;

      void audio.play().catch((err: Error) => {
        // Handle browser autoplay policy restrictions or format errors
        set({
          playbackStatus: 'paused',
          error: err?.name === 'NotAllowedError' ? 'Click play to start sound' : 'Playback error',
        });
      });
    },

    togglePlay: () => {
      const audio = getAudioElement();
      if (!audio) return;

      const state = get();
      if (!state.currentTrack) {
        // Start first available track
        const first = musicCatalog[0];
        if (first) {
          state.playTrack(first, musicCatalog);
        }
        return;
      }

      if (state.playbackStatus === 'playing') {
        audio.pause();
        set({ playbackStatus: 'paused' });
      } else {
        void audio.play().catch((err) => {
          set({ playbackStatus: 'error', error: err?.message || 'Failed to resume' });
        });
      }
    },

    pause: () => {
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        set({ playbackStatus: 'paused' });
      }
    },

    resume: () => {
      const audio = getAudioElement();
      if (audio) {
        void audio.play().catch((err) => {
          set({ playbackStatus: 'error', error: err?.message || 'Failed to play' });
        });
      }
    },

    stop: () => {
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        set({ playbackStatus: 'idle', currentTime: 0 });
      }
    },

    nextTrack: () => {
      const state = get();
      if (!state.currentTrack) return;

      // Check explicit queue first
      if (state.queue.length > 0) {
        const next = state.queue[0];
        const remainingQueue = state.queue.slice(1);
        set({ queue: remainingQueue });
        state.playTrack(next);
        return;
      }

      // If shuffle is active, pick random track from catalog
      if (state.isShuffle) {
        const pool = musicCatalog.filter((t) => t.id !== state.currentTrack?.id);
        if (pool.length > 0) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          state.playTrack(pool[randomIndex]);
          return;
        }
      }

      // Default linear progression in catalog
      const currentIndex = musicCatalog.findIndex((t) => t.id === state.currentTrack?.id);
      if (currentIndex === -1) return;

      const nextIndex = currentIndex + 1;
      if (nextIndex < musicCatalog.length) {
        state.playTrack(musicCatalog[nextIndex]);
      } else if (state.repeatMode === 'all') {
        // Loop back to start
        state.playTrack(musicCatalog[0]);
      } else {
        // End of playlist
        state.pause();
      }
    },

    prevTrack: () => {
      const audio = getAudioElement();
      const state = get();

      // Standard Spotify behavior: if track played > 3 seconds, restart current track
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        set({ currentTime: 0 });
        return;
      }

      // Otherwise go to previous in catalog
      if (!state.currentTrack) return;
      const currentIndex = musicCatalog.findIndex((t) => t.id === state.currentTrack?.id);
      if (currentIndex > 0) {
        state.playTrack(musicCatalog[currentIndex - 1]);
      } else if (state.repeatMode === 'all') {
        state.playTrack(musicCatalog[musicCatalog.length - 1]);
      } else {
        if (audio) audio.currentTime = 0;
      }
    },

    seek: (seconds: number) => {
      const audio = getAudioElement();
      if (audio) {
        const clamped = Math.max(0, Math.min(seconds, audio.duration || get().duration));
        audio.currentTime = clamped;
        set({ currentTime: clamped });
      }
    },

    seekRelative: (deltaSeconds: number) => {
      const audio = getAudioElement();
      if (audio) {
        const newTime = audio.currentTime + deltaSeconds;
        const clamped = Math.max(0, Math.min(newTime, audio.duration || get().duration));
        audio.currentTime = clamped;
        set({ currentTime: clamped });
      }
    },

    setVolume: (volume: number) => {
      const audio = getAudioElement();
      const clamped = Math.max(0, Math.min(1, volume));
      if (audio) {
        audio.volume = clamped;
        if (clamped > 0 && audio.muted) {
          audio.muted = false;
        }
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
        } catch {
          // Ignore storage errors in private browsing
        }
      }
      set({ volume: clamped, isMuted: clamped === 0 });
    },

    toggleMute: () => {
      const audio = getAudioElement();
      const state = get();
      const newMuted = !state.isMuted;
      if (audio) {
        audio.muted = newMuted;
      }
      set({ isMuted: newMuted });
    },

    toggleShuffle: () => {
      set((prev) => ({ isShuffle: !prev.isShuffle }));
    },

    cycleRepeatMode: () => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const current = get().repeatMode;
      const nextIndex = (modes.indexOf(current) + 1) % modes.length;
      set({ repeatMode: modes[nextIndex] });
    },

    toggleFavorite: (trackId: string) => {
      set((prev) => {
        const isFav = prev.favorites.includes(trackId);
        const newFavs = isFav
          ? prev.favorites.filter((id) => id !== trackId)
          : [...prev.favorites, trackId];

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavs));
          } catch {
            // Ignore storage errors in private browsing
          }
        }
        return { favorites: newFavs };
      });
    },

    addToQueue: (track: Track) => {
      set((prev) => ({ queue: [...prev.queue, track] }));
    },

    removeFromQueue: (index: number) => {
      set((prev) => {
        const newQueue = [...prev.queue];
        newQueue.splice(index, 1);
        return { queue: newQueue };
      });
    },

    clearQueue: () => {
      set({ queue: [] });
    },

    setExpanded: (expanded: boolean) => {
      set({ isExpanded: expanded });
    },
  };
});
