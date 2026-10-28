import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Command,
} from 'lucide-react';
import { navItems, utilityNavItems, labelFor } from './navConfig';
import { useAuthStore } from '@/stores/auth';

interface FloatingDockProps {
  onOpenCommand?: () => void;
}

export function FloatingDock({ onOpenCommand }: FloatingDockProps): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const ageGroup = user?.ageGroup ?? 'adult';

  return (
    <aside
      aria-label="Main Navigation Dock"
      className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center lg:flex"
    >
      <div className="relative flex flex-col items-center gap-1.5 rounded-3xl border border-[var(--glass-dock-border)] bg-[var(--glass-dock-bg)] p-2.5 shadow-[var(--glass-dock-shadow)] backdrop-blur-2xl">
        {/* Top Brand Logo / Spark Emblem */}
        <NavLink
          to="/dashboard"
          className="group relative mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(56,189,248,0.7)]"
          aria-label="AuraWell Home"
        >
          <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
        </NavLink>

        {/* Navigation Item Stack */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive =
              item.to === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            const label = labelFor(item, ageGroup);

            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.to}
                  aria-label={label}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary shadow-sm ring-1 ring-primary/40 dark:bg-indigo-600/30 dark:text-white dark:shadow-[0_0_20px_rgba(99,102,241,0.45)] dark:ring-indigo-400/50'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {/* Active background layout highlight */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDockIndicator"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`relative z-10 h-5 w-5 transition-transform duration-200 ${
                      isActive ? 'text-primary dark:text-indigo-200 scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                </NavLink>

                {/* Floating Tooltip to the right */}
                <AnimatePresence>
                  {hoveredItem === item.to && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 16, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute left-full top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xl backdrop-blur-xl"
                    >
                      <span>{label}</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-card" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-1.5 h-px w-6 bg-border" />

        {/* Bottom Actions: Search, Utilities, Theme */}
        <div className="flex flex-col gap-1.5">
          {onOpenCommand && (
            <div
              className="relative"
              onMouseEnter={() => setHoveredItem('cmd')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                type="button"
                onClick={onOpenCommand}
                aria-label="Quick Command Search"
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <Command className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {hoveredItem === 'cmd' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 16, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute left-full top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xl backdrop-blur-xl"
                  >
                    <span>Quick Search (⌘K)</span>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-card" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {utilityNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.to}
                  aria-label={item.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/40 shadow-sm dark:bg-indigo-600/30 dark:text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.35)] dark:ring-indigo-400/50'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </NavLink>

                <AnimatePresence>
                  {hoveredItem === item.to && (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 16, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute left-full top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xl backdrop-blur-xl"
                    >
                      <span>{item.label}</span>
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-card" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
