import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Footprints,
  Gamepad2,
  LayoutDashboard,
  Moon,
  Music,
  Settings,
  Shield,
  Smile,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { AgeGroup } from '@/types';

export interface NavItem {
  to: string;
  label: string;
  childLabel?: string;
  icon: LucideIcon;
  /** AURA chat is replaced by structured activities for children. */
  counseling?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', childLabel: 'My Space', icon: LayoutDashboard },
  { to: '/assessments', label: 'AuraAssess', childLabel: 'Check-ins', icon: ClipboardList },
  { to: '/games', label: 'MindPlay', childLabel: 'Play', icon: Gamepad2 },
  { to: '/music', label: 'Peaceful Sounds', childLabel: 'Calm Sounds', icon: Music },
  { to: '/mood', label: 'Mood', childLabel: 'Feelings', icon: Smile },
  { to: '/journal', label: 'Journal', childLabel: 'My Story', icon: BookOpen },
  { to: '/sleep', label: 'Sleep', childLabel: 'Sleep', icon: Moon },
  { to: '/activity', label: 'Activity', childLabel: 'Move', icon: Footprints },
  { to: '/habits', label: 'Habits', childLabel: 'Habits', icon: CheckCircle2 },
  { to: '/counseling', label: 'AURA', childLabel: 'Guided Time', icon: Sparkles, counseling: true },
  { to: '/analytics', label: 'Insights', childLabel: 'My Progress', icon: BarChart3 },
];

export const utilityNavItems: NavItem[] = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/privacy', label: 'Privacy', icon: Shield },
];

export function labelFor(item: NavItem, ageGroup: AgeGroup): string {
  if (ageGroup === 'child' && item.childLabel) return item.childLabel;
  return item.label;
}
