import { getScoreRating } from '../../data/constants';

/**
 * Circular score gauge (0-100) drawn with two SVG circles.
 * The coloured arc length is proportional to the score.
 */
export default function ScoreGauge({ score, size = 168, stroke = 12, label = 'Security score' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const rating = getScoreRating(clamped);
  const gradientId = `score-gradient-${size}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--sg-primary)" />
            <stop offset="100%" stopColor="var(--sg-accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--sg-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tracking-tight text-ink tabular-nums">{clamped}</span>
        <span className="text-xs font-medium text-subtle">out of 100</span>
        <span
          className="mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ color: rating.color, background: `color-mix(in srgb, ${rating.color} 14%, transparent)` }}
        >
          {rating.label}
        </span>
      </div>
    </div>
  );
}
