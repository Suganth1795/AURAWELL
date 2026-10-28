import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  Gamepad2,
  Smile,
  BookOpen,
  Moon,
  Footprints,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Music,
  Settings,
  Shield,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Pages' | 'Wellness Tools' | 'System';
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Daily overview, recommendations & streaks',
    to: '/dashboard',
    icon: LayoutDashboard,
    category: 'Pages',
  },
  {
    id: 'music',
    title: 'Peaceful Sounds & Nature Ambience',
    subtitle: 'Calming rain, ocean waves, forest sounds, meditation bells',
    to: '/music',
    icon: Music,
    category: 'Wellness Tools',
  },
  {
    id: 'assessments',
    title: 'AuraAssess Check-ins',
    subtitle: 'Age-appropriate wellness reflection questionnaires',
    to: '/assessments',
    icon: ClipboardList,
    category: 'Wellness Tools',
  },
  {
    id: 'games',
    title: 'MindPlay Cognitive Games',
    subtitle: 'Playable focus, memory & calm exercises',
    to: '/games',
    icon: Gamepad2,
    category: 'Wellness Tools',
  },
  {
    id: 'mood',
    title: 'Mood & Emotions',
    subtitle: 'Log and reflect on daily emotions',
    to: '/mood',
    icon: Smile,
    category: 'Wellness Tools',
  },
  {
    id: 'journal',
    title: 'Mindful Journal',
    subtitle: 'Private prompt-based reflection',
    to: '/journal',
    icon: BookOpen,
    category: 'Wellness Tools',
  },
  {
    id: 'sleep',
    title: 'Sleep Rhythm',
    subtitle: 'Rest quality, duration and routines',
    to: '/sleep',
    icon: Moon,
    category: 'Wellness Tools',
  },
  {
    id: 'activity',
    title: 'Movement & Vitality',
    subtitle: 'Physical activity and gentle movement',
    to: '/activity',
    icon: Footprints,
    category: 'Wellness Tools',
  },
  {
    id: 'habits',
    title: 'Habit Mastery',
    subtitle: 'Micro-habits and streak builder',
    to: '/habits',
    icon: CheckCircle2,
    category: 'Wellness Tools',
  },
  {
    id: 'counseling',
    title: 'AURA Guided Reflection',
    subtitle: 'Empathetic AI reflection companion',
    to: '/counseling',
    icon: Sparkles,
    category: 'Wellness Tools',
  },
  {
    id: 'analytics',
    title: 'Insights & Trends',
    subtitle: 'Holistic wellness radar and multi-day patterns',
    to: '/analytics',
    icon: BarChart3,
    category: 'Pages',
  },
  {
    id: 'settings',
    title: 'Preferences & Profile',
    subtitle: 'Theme, age-group tailoring, notifications',
    to: '/settings',
    icon: Settings,
    category: 'System',
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Export',
    subtitle: 'Client consent records and account management',
    to: '/privacy',
    icon: Shield,
    category: 'System',
  },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps): React.JSX.Element | null {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filtered = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].to);
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, navigate, handleClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 sm:p-6 sm:pt-28">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close command search"
        className="fixed inset-0 bg-scrim backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-2xl text-foreground">
        <div className="flex items-center border-b border-border px-4 py-3.5">
          <Search className="mr-3 h-5 w-5 text-primary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools, games, reflection spaces..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matching pages or tools found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(item.to);
                        handleClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                        isSelected
                          ? 'bg-primary/15 text-primary font-semibold ring-1 ring-primary/40 dark:bg-indigo-600/30 dark:text-white dark:ring-indigo-500/40'
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-sm font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </div>
                      {isSelected && <ArrowRight className="h-4 w-4 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <span>Use &uarr; &darr; to navigate, Enter to select</span>
          <span className="rounded bg-muted border border-border/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
}
