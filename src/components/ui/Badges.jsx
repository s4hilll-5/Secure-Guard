import { SEVERITY_CONFIG, STATUS_CONFIG } from '../../data/constants';

/** Severity pill with icon - colour is never the only signal (icon + text). */
export function SeverityBadge({ severity, size = 'md' }) {
  const config = SEVERITY_CONFIG[severity];
  if (!config) return null;
  const Icon = config.icon;
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.badge} ${sizing}`}>
      <Icon className="h-3 w-3" />
      {severity}
    </span>
  );
}

/** Alert status pill (Open / Investigating / Resolved). */
export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

/** Clear "simulated data" label required for the scanner. */
export function SimulatedBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase ${className}`}
    >
      Simulated sample data
    </span>
  );
}
