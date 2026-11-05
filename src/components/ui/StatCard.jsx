import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * KPI tile: icon, label, big number and an optional trend line.
 * `trendPositive` decides whether the trend is good news (green) or bad news (red),
 * because "up" is not always good in security (e.g. more critical issues).
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'var(--sg-primary)',
  trend,
  trendPositive,
  hint,
  delay = 0,
}) {
  const TrendIcon = trend?.startsWith('-') ? TrendingDown : TrendingUp;
  return (
    <div
      className="glass-card animate-fade-up group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-line-strong"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* soft colour wash in the corner */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35"
        style={{ background: iconColor }}
      />
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${iconColor} 14%, transparent)`, color: iconColor }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
      {(trend || hint) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold ${
                trendPositive ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical'
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              {trend}
            </span>
          )}
          {hint && <span className="text-subtle">{hint}</span>}
        </div>
      )}
    </div>
  );
}
