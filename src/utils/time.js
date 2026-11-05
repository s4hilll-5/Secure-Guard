/**
 * Date & time helpers used across the dashboard.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** ISO timestamp `minutes` minutes before now (used to build fresh-looking sample data). */
export const minutesAgo = (minutes) => new Date(Date.now() - minutes * MINUTE).toISOString();

/** "just now", "5m ago", "3h ago", "2d ago" or a short date for older values. */
export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(diff)) return '';
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return formatDate(isoString);
}

/** e.g. "6 Nov 2026" */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "6 Nov 2026, 14:32" */
export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** e.g. "Friday, 6 November 2026" - shown in the top bar. */
export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Short unique id with a readable prefix, e.g. "ALT-K3J9X2". */
export const createId = (prefix = 'ID') => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** e.g. "Fri, 6 Nov" - compact top-bar date for small screens. */
export function formatShortDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
