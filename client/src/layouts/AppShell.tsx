import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { labelFor, navItems, utilityNavItems, type NavItem } from '@/components/navigation/navConfig';
import { NotificationsBell } from '@/features/notifications/NotificationsBell';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function AppShell(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const ageGroup = user?.ageGroup ?? 'adult';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary text-primary-foreground shadow-[var(--shadow-glow)]'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    );

  const renderNavItem = (item: NavItem) => (
    <li key={item.to}>
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        className={navLinkClass}
        onClick={() => setMenuOpen(false)}
      >
        <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden="true" />
        {labelFor(item, ageGroup)}
      </NavLink>
    </li>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2.5 text-lg font-semibold">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[var(--shadow-glow)]">
              <Sparkles className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">
              AuraWell <span className="text-gradient">AI</span>
            </span>
          </NavLink>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationsBell />
                <span
                  className="hidden rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground lg:inline"
                  aria-label="Your progress"
                >
                  {user.wellness.avatar.emoji} Level {user.wellness.level} · {user.wellness.xp} XP
                </span>
                <span className="hidden max-w-40 truncate text-sm font-medium sm:inline" title={user.displayName}>
                  {user.displayName}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Backdrop for the mobile drawer */}
        {menuOpen ? (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-20 bg-scrim backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <nav
          aria-label="Main navigation"
          className={cn(
            'shrink-0 lg:block',
            'fixed inset-y-16 left-0 z-30 w-64 overflow-y-auto border-r border-border bg-card p-4 lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100dvh-4rem)] lg:w-60 lg:border-0 lg:bg-transparent lg:p-0',
            menuOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <ul className="space-y-1">
            {navItems.map(renderNavItem)}
          </ul>
          <ul className="mt-6 space-y-1 border-t border-border pt-4">
            {utilityNavItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-border px-4 py-5 sm:px-6 lg:px-8">
        <p className="mx-auto w-full max-w-5xl text-center text-xs text-muted-foreground">
          AuraWell AI supports wellness reflection and education. It is not a medical device and does
          not diagnose or treat mental health conditions. In an emergency, contact local emergency
          services.
        </p>
      </footer>
    </div>
  );
}
