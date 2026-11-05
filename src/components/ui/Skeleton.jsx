/** Pulsing grey placeholder block shown while content is loading. */
export default function Skeleton({ className = '', ...props }) {
  return <div className={`animate-pulse rounded-xl bg-elevated-hover ${className}`} {...props} />;
}

/** Placeholder sized like a chart card body. */
export function ChartSkeleton({ height = 260 }) {
  return (
    <div className="flex flex-col gap-3" style={{ height }}>
      <div className="flex flex-1 items-end gap-3">
        {[45, 70, 55, 85, 60, 40, 30].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
