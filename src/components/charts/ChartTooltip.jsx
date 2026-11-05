/**
 * Custom Recharts tooltip that matches the glass UI.
 * Recharts passes `active`, `payload` and `label` automatically.
 */
export default function ChartTooltip({ active, payload, label, valueSuffix = '' }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-xl border border-line-strong bg-surface-solid px-3 py-2.5 text-xs shadow-xl shadow-black/30">
      {label !== undefined && label !== '' && <p className="mb-1.5 font-semibold text-ink">{label}</p>}
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: entry.payload?.color ?? entry.color ?? entry.stroke }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-ink tabular-nums">
              {entry.value}
              {valueSuffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
