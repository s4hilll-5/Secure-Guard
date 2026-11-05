/**
 * Row of pill buttons where exactly one option is active.
 * Used for severity filters, chart ranges and theme pickers.
 * options: [{ value, label, count? }]
 */
export default function SegmentedControl({ options, value, onChange, ariaLabel, size = 'md' }) {
  const sizing = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]';
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-elevated p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition duration-200 ${sizing} ${
              active ? 'bg-surface-solid text-ink shadow-sm ring-1 ring-line-strong' : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`rounded-md px-1.5 text-[11px] tabular-nums ${active ? 'bg-primary-soft text-primary' : 'bg-elevated text-subtle'}`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
