import { CheckCircle2, Circle, Loader2, Radar, X } from 'lucide-react';
import { SCAN_STAGES } from '../../data/scanSimulator';
import Button from '../ui/Button';

/** Animated "radar" loader with a progress bar and checklist of scan stages. */
export default function ScanProgress({ host, progress, stageIndex, onCancel }) {
  return (
    <div className="glass-card animate-fade-up overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        {/* Radar animation */}
        <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
          <span className="animate-ping-slow absolute h-full w-full rounded-full border border-primary/40" />
          <span className="absolute h-full w-full rounded-full border border-line-strong" />
          <span className="absolute h-2/3 w-2/3 rounded-full border border-line-strong" />
          <span className="absolute h-1/3 w-1/3 rounded-full border border-line-strong" />
          <span
            className="animate-radar absolute h-full w-full rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, var(--sg-primary-soft) 60deg, transparent 90deg)',
            }}
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/40">
            <Radar className="h-6 w-6" />
          </span>
        </div>

        <div className="w-full flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">Simulated scan in progress</p>
              <h3 className="mt-1 text-lg font-semibold break-all text-ink">{host}</h3>
            </div>
            <Button variant="secondary" size="sm" icon={X} onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-muted">{SCAN_STAGES[stageIndex]}...</span>
              <span className="font-semibold text-ink tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-elevated"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {SCAN_STAGES.map((stage, index) => {
              const done = index < stageIndex;
              const active = index === stageIndex;
              return (
                <li
                  key={stage}
                  className={`flex items-center gap-2 text-sm ${done ? 'text-ink' : active ? 'text-primary' : 'text-subtle'}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  {stage}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
