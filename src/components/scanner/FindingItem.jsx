import { BookOpen, ChevronDown, Lightbulb, MapPin } from 'lucide-react';
import { SEVERITY_CONFIG } from '../../data/constants';
import { SeverityBadge } from '../ui/Badges';

/** One expandable finding row: summary line + details and recommendation. */
export default function FindingItem({ finding, expanded, onToggle }) {
  const color = SEVERITY_CONFIG[finding.severity].color;

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-elevated transition hover:border-line-strong">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: color }} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{finding.title}</span>
          <span className="mt-0.5 block text-xs text-subtle">
            <span className="font-mono">{finding.id}</span> · {finding.category}
          </span>
        </span>
        <span className="hidden sm:block">
          <SeverityBadge severity={finding.severity} size="sm" />
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-subtle transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="animate-fade-up space-y-4 border-t border-line px-4 py-4 sm:pl-8">
          <div className="sm:hidden">
            <SeverityBadge severity={finding.severity} size="sm" />
          </div>
          <p className="text-sm leading-relaxed text-muted">{finding.description}</p>
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <p className="flex items-center gap-2 text-muted">
              <MapPin className="h-3.5 w-3.5 text-subtle" />
              Location: <span className="font-mono text-ink">{finding.location}</span>
            </p>
            <p className="flex items-center gap-2 text-muted">
              <BookOpen className="h-3.5 w-3.5 text-subtle" />
              {finding.reference}
            </p>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/[0.06] p-3.5">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-success uppercase">
              <Lightbulb className="h-3.5 w-3.5" /> Recommendation
            </p>
            <p className="text-sm leading-relaxed text-ink">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </li>
  );
}
