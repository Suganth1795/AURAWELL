import { describe, expect, it, beforeEach } from 'vitest';
import { musicCatalog, MUSIC_CATEGORIES } from '@/features/music/musicCatalog';
import { useMusicStore } from '@/features/music/musicStore';

describe('musicCatalog', () => {
  it('registers all 19 real audio tracks from client/src/music/', () => {
    expect(musicCatalog.length).toBe(19);
  });

  it('ensures each track has valid required metadata', () => {
    for (const track of musicCatalog) {
      expect(track.id).toBeTruthy();
      expect(track.title).toBeTruthy();
      expect(track.filename).toBeTruthy();
      expect(track.src).toBeTruthy();
      expect(track.category).toBeTruthy();
      expect(track.mood).toBeTruthy();
      expect(track.description).toBeTruthy();
      expect(track.tags.length).toBeGreaterThan(0);
      expect(track.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(track.themeGradient).toBeTruthy();
      expect(track.isAvailable).toBe(true);
    }
  });

  it('contains expected wellness sound categories', () => {
    const categories = new Set(musicCatalog.map((t) => t.category));
    expect(categories.has('Rain')).toBe(true);
    expect(categories.has('Ocean')).toBe(true);
    expect(categories.has('Forest')).toBe(true);
    expect(categories.has('Water')).toBe(true);
    expect(categories.has('Wind')).toBe(true);
    expect(categories.has('Meditation')).toBe(true);
    expect(categories.has('Ambient Music')).toBe(true);
  });

  it('provides all expected filter categories in MUSIC_CATEGORIES', () => {
    expect(MUSIC_CATEGORIES).toContain('All');
    expect(MUSIC_CATEGORIES).toContain('Rain');
    expect(MUSIC_CATEGORIES).toContain('Ocean');
    expect(MUSIC_CATEGORIES).toContain('Forest');
    expect(MUSIC_CATEGORIES).toContain('Water');
    expect(MUSIC_CATEGORIES).toContain('Wind');
    expect(MUSIC_CATEGORIES).toContain('Meditation');
    expect(MUSIC_CATEGORIES).toContain('Ambient Music');
    expect(MUSIC_CATEGORIES).toContain('Favorites');
  });

  it('includes key soundscapes like Calming Rain and Ocean Waves', () => {
    const rain = musicCatalog.find((t) => t.id === 'calming-rain');
    expect(rain).toBeDefined();
    expect(rain?.title).toBe('Calming Rain');
    expect(rain?.category).toBe('Rain');

    const ocean = musicCatalog.find((t) => t.id === 'soothing-ocean-waves');
    expect(ocean).toBeDefined();
    expect(ocean?.title).toBe('Soothing Ocean Waves');
    expect(ocean?.category).toBe('Ocean');

    const bell = musicCatalog.find((t) => t.id === 'tibetan-singing-bell');
    expect(bell).toBeDefined();
    expect(bell?.title).toBe('Tibetan Singing Bell');
    expect(bell?.category).toBe('Meditation');
  });
});

describe('useMusicStore', () => {
  beforeEach(() => {
    useMusicStore.setState({
      currentTrack: null,
      playbackStatus: 'idle',
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      repeatMode: 'off',
      queue: [],
      history: [],
      favorites: [],
      isExpanded: false,
      error: null,
    });
  });

  it('manages favorites with add and remove', () => {
    const { toggleFavorite } = useMusicStore.getState();

    toggleFavorite('calming-rain');
    expect(useMusicStore.getState().favorites).toContain('calming-rain');

    toggleFavorite('soothing-ocean-waves');
    expect(useMusicStore.getState().favorites).toEqual(['calming-rain', 'soothing-ocean-waves']);

    // Toggle off
    toggleFavorite('calming-rain');
    expect(useMusicStore.getState().favorites).toEqual(['soothing-ocean-waves']);
  });

  it('cycles repeat mode off -> all -> one -> off', () => {
    const { cycleRepeatMode } = useMusicStore.getState();

    expect(useMusicStore.getState().repeatMode).toBe('off');

    cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('all');

    cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('one');

    cycleRepeatMode();
    expect(useMusicStore.getState().repeatMode).toBe('off');
  });

  it('toggles shuffle mode', () => {
    const { toggleShuffle } = useMusicStore.getState();

    expect(useMusicStore.getState().isShuffle).toBe(false);

    toggleShuffle();
    expect(useMusicStore.getState().isShuffle).toBe(true);

    toggleShuffle();
    expect(useMusicStore.getState().isShuffle).toBe(false);
  });

  it('sets and clamps volume correctly', () => {
    const { setVolume } = useMusicStore.getState();

    setVolume(0.5);
    expect(useMusicStore.getState().volume).toBe(0.5);

    // Clamp over 1
    setVolume(1.5);
    expect(useMusicStore.getState().volume).toBe(1.0);

    // Clamp below 0
    setVolume(-0.5);
    expect(useMusicStore.getState().volume).toBe(0);
  });

  it('manages queue operations: add, remove, and clear', () => {
    const { addToQueue, removeFromQueue, clearQueue } = useMusicStore.getState();
    const track1 = musicCatalog[0];
    const track2 = musicCatalog[1];
    const track3 = musicCatalog[2];

    addToQueue(track1);
    addToQueue(track2);
    addToQueue(track3);

    expect(useMusicStore.getState().queue.length).toBe(3);
    expect(useMusicStore.getState().queue[0].id).toBe(track1.id);

    // Remove middle item
    removeFromQueue(1);
    expect(useMusicStore.getState().queue.length).toBe(2);
    expect(useMusicStore.getState().queue[1].id).toBe(track3.id);

    // Clear queue
    clearQueue();
    expect(useMusicStore.getState().queue.length).toBe(0);
  });

  it('sets expanded modal state', () => {
    const { setExpanded } = useMusicStore.getState();

    setExpanded(true);
    expect(useMusicStore.getState().isExpanded).toBe(true);

    setExpanded(false);
    expect(useMusicStore.getState().isExpanded).toBe(false);
  });
});
