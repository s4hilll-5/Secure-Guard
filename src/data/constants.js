import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

/**
 * Severity levels, ordered from most to least severe.
 * Colours are kept in one place so badges, charts and reports stay consistent.
 */
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

export const SEVERITY_CONFIG = {
  Critical: {
    color: '#ef4444',
    weight: 4,
    icon: AlertOctagon,
    badge: 'bg-critical/12 text-critical border-critical/25',
    dot: 'bg-critical',
  },
  High: {
    color: '#f97316',
    weight: 3,
    icon: ShieldAlert,
    badge: 'bg-high/12 text-high border-high/25',
    dot: 'bg-high',
  },
  Medium: {
    color: '#eab308',
    weight: 2,
    icon: AlertTriangle,
    badge: 'bg-medium/12 text-medium border-medium/25',
    dot: 'bg-medium',
  },
  Low: {
    color: '#38bdf8',
    weight: 1,
    icon: Info,
    badge: 'bg-low/12 text-low border-low/25',
    dot: 'bg-low',
  },
};

export const ALERT_STATUSES = ['Open', 'Investigating', 'Resolved'];

export const STATUS_CONFIG = {
  Open: { badge: 'bg-critical/10 text-critical border-critical/20', dot: 'bg-critical' },
  Investigating: { badge: 'bg-medium/10 text-medium border-medium/20', dot: 'bg-medium' },
  Resolved: { badge: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
};

/** Chart series colours (validated for separation on the dark surface). */
export const CHART_COLORS = {
  detected: '#4f8df7',
  resolved: '#2ebd85',
  score: '#8b5cf6',
};

/** LocalStorage keys - prefixed so they never clash with other apps on localhost. */
export const STORAGE_KEYS = {
  alerts: 'secureguard:alerts',
  notifications: 'secureguard:notifications',
  activity: 'secureguard:activity',
  scans: 'secureguard:scan-history',
  settings: 'secureguard:settings',
  sidebar: 'secureguard:sidebar-collapsed',
};

/** Score label shown next to a 0-100 security score. */
export function getScoreRating(score) {
  if (score >= 85) return { label: 'Good', color: '#22c55e' };
  if (score >= 70) return { label: 'Fair', color: '#eab308' };
  if (score >= 50) return { label: 'Weak', color: '#f97316' };
  return { label: 'At risk', color: '#ef4444' };
}
