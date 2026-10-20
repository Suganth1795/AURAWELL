import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { labelFor, navItems, utilityNavItems } from '@/components/navigation/navConfig';
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
      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>AuraWell AI</span>
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline" aria-label="Current streak">
                  {user.wellness.avatar.emoji} Level {user.wellness.level} · {user.wellness.xp} XP
                </span>
                <span className="max-w-32 truncate text-sm font-medium" title={user.displayName}>
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

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <nav
          aria-label="Main navigation"
          className={cn(
            'w-56 shrink-0 md:block',
            menuOpen ? 'block' : 'hidden',
          )}
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/dashboard'} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {labelFor(item, ageGroup)}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-1 border-t border-border pt-4">
            {utilityNavItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
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

      <footer className="border-t border-border py-4">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          AuraWell AI supports wellness reflection and education. It is not a medical device and does
          not diagnose or treat mental health conditions. In an emergency, contact local emergency
          services.
        </p>
      </footer>
    </div>
  );
}
