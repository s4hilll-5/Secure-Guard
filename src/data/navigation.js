import { BarChart3, LayoutDashboard, Radar, Settings, ShieldAlert } from 'lucide-react';

/** Single source of truth for sidebar links, page titles and global search. */
export const NAV_ITEMS = [
  {
    path: '/',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'Security posture at a glance',
  },
  {
    path: '/scanner',
    label: 'Vulnerability Scanner',
    icon: Radar,
    description: 'Run a simulated website scan',
  },
  {
    path: '/alerts',
    label: 'Security Alerts',
    icon: ShieldAlert,
    description: 'Triage and resolve alerts',
    badgeKey: 'openAlerts',
  },
  {
    path: '/reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Charts and downloadable reports',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Profile, notifications and theme',
  },
];
