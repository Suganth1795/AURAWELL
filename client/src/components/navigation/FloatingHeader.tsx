import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Flame,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

interface FloatingHeaderProps {
  onOpenCommand: () => void;
  onToggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

export function FloatingHeader({
  onOpenCommand,
  onToggleMobileMenu,
  mobileMenuOpen,
}: FloatingHeaderProps): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 rounded-2xl border border-[var(--glass-dock-border)] bg-[var(--glass-dock-bg)] px-4 shadow-[var(--glass-dock-shadow)] backdrop-blur-2xl">
        {/* Left Section: Mobile trigger & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2 text-base font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline font-bold tracking-tight text-foreground">
              AuraWell <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </span>
          </NavLink>
        </div>

        {/* Center Section: Pill Search Bar (Command Palette Trigger) */}
        <div className="flex flex-1 max-w-md justify-center">
          <button
            type="button"
            onClick={onOpenCommand}
            className="flex w-full items-center justify-between rounded-full border border-border/80 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground shadow-inner transition-all hover:border-border hover:bg-muted/80 hover:text-foreground"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">Search wellness tools, games, reflection...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Status Pills & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <NotificationsBell />

              {/* Streak badge */}
              <div
                className="hidden md:flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-300"
                title={`${user.wellness.streakDays}-day streak`}
              >
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span>{user.wellness.streakDays}d streak</span>
              </div>

              {/* Level & XP pill */}
              <div
                className="hidden xl:flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
              >
                <span>{user.wellness.avatar.emoji}</span>
                <span>Lv {user.wellness.level}</span>
                <span className="text-indigo-400/60">·</span>
                <span className="text-muted-foreground">{user.wellness.xp} XP</span>
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <span className="hidden max-w-28 truncate text-xs font-medium text-foreground sm:inline" title={user.displayName}>
                  {user.displayName.split(' ')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
