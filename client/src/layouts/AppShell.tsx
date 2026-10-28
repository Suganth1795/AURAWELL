import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { labelFor, navItems, utilityNavItems, type NavItem } from '@/components/navigation/navConfig';
import { FloatingDock } from '@/components/navigation/FloatingDock';
import { FloatingHeader } from '@/components/navigation/FloatingHeader';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { NowPlayingBar } from '@/features/music/components/NowPlayingBar';
import { ExpandedPlayer } from '@/features/music/components/ExpandedPlayer';
import { useMusicStore } from '@/features/music/musicStore';
import { cn } from '@/utils/cn';

export function AppShell(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const ageGroup = user?.ageGroup ?? 'adult';

  // Global ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary/15 text-primary font-semibold shadow-sm ring-1 ring-primary/30 dark:bg-indigo-600/30 dark:text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.35)] dark:ring-indigo-500/40'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    );

  const renderMobileNavItem = (item: NavItem) => (
    <li key={item.to}>
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        className={navLinkClass}
        onClick={() => setMenuOpen(false)}
      >
        <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {labelFor(item, ageGroup)}
      </NavLink>
    </li>
  );

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden text-foreground">
      {/* Dynamic Cosmic Starfield & Ambient Lighting Background */}
      <CosmicBackground showBeam={true} />

      {/* Accessible Skip Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Floating Vertical Dock Navigation (Desktop) */}
      <FloatingDock onOpenCommand={() => setCommandOpen(true)} />

      {/* Floating Glass Top Header */}
      <FloatingHeader
        onOpenCommand={() => setCommandOpen(true)}
        onToggleMobileMenu={() => setMenuOpen((v) => !v)}
        mobileMenuOpen={menuOpen}
      />

      {/* Interactive Command Palette Modal */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Mobile Drawer Navigation (Phone / Small screens) */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu drawer"
            className="fixed inset-0 bg-scrim backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 p-5 shadow-2xl backdrop-blur-2xl text-foreground">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <span className="font-bold tracking-tight text-foreground">AuraWell Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <nav className="overflow-y-auto">
              <ul className="space-y-1">{navItems.map(renderMobileNavItem)}</ul>
              <ul className="mt-6 space-y-1 border-t border-border pt-4">
                {utilityNavItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}

      {/* Main Content Area — padded to avoid left floating dock and bottom music player */}
      <div className={cn(
        'flex w-full flex-1 justify-center px-4 py-6 sm:px-6 lg:pl-24 lg:pr-8',
        currentTrack ? 'pb-28' : '',
      )}>
        <main id="main" className="w-full max-w-7xl min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Sleek Minimal Cosmic Footer */}
      <footer className={cn(
        'border-t border-border px-4 py-5 sm:px-6 lg:pl-24 lg:pr-8',
        currentTrack ? 'mb-20' : '',
      )}>
        <p className="mx-auto w-full max-w-5xl text-center text-xs text-muted-foreground">
          AuraWell AI supports wellness reflection and education. It is not a medical device and does
          not diagnose or treat mental health conditions. In an emergency, contact local emergency
          services.
        </p>
      </footer>

      {/* Persistent Spotify-Style Bottom Music Player & Immersive Expanded View */}
      <NowPlayingBar />
      <ExpandedPlayer />
    </div>
  );
}
