import { useMemo, useState } from 'react';
import { CalendarClock, Download, FileSearch, Globe, RotateCcw, Timer } from 'lucide-react';
import { SEVERITIES, SEVERITY_CONFIG } from '../../data/constants';
import { downloadFile } from '../../utils/download';
import { formatDateTime } from '../../utils/time';
import { SimulatedBadge } from '../ui/Badges';
import Button from '../ui/Button';
import ScoreGauge from '../ui/ScoreGauge';
import SegmentedControl from '../ui/SegmentedControl';
import EmptyState from '../ui/EmptyState';
import FindingItem from './FindingItem';

/** Full report for one simulated scan: score, severity breakdown and findings. */
export default function ScanResults({ report, onRescan }) {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(report.findings[0]?.id ?? null);

  const visibleFindings = useMemo(
    () => (severityFilter === 'All' ? report.findings : report.findings.filter((f) => f.severity === severityFilter)),
    [report.findings, severityFilter],
  );

  const exportJson = () => {
    downloadFile(
      JSON.stringify({ notice: 'Simulated sample data - no real scan was performed.', ...report }, null, 2),
      `secureguard-scan-${report.host}.json`,
      'application/json',
    );
  };

  const filterOptions = [
    { value: 'All', label: 'All', count: report.findings.length },
    ...SEVERITIES.map((severity) => ({ value: severity, label: severity, count: report.counts[severity] })),
  ];

  return (
    <div className="glass-card animate-fade-up">
      {/* Summary header */}
      <div className="flex flex-col gap-6 border-b border-line p-5 sm:p-6 lg:flex-row lg:items-center">
        <ScoreGauge score={report.score} size={150} stroke={11} label="Simulated security score" />

        <div className="min-w-0 flex-1">
          <SimulatedBadge />
          <h2 className="mt-3 flex items-center gap-2 text-xl font-bold break-all text-ink">
            <Globe className="h-5 w-5 shrink-0 text-primary" />
            {report.host}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> {formatDateTime(report.scannedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" /> {report.durationSeconds}s
            </span>
            <span className="flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5" /> {report.pagesCrawled} pages (simulated)
            </span>
          </div>

          {/* Severity tiles - click to filter the findings list */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEVERITIES.map((severity) => {
              const config = SEVERITY_CONFIG[severity];
              const Icon = config.icon;
              const active = severityFilter === severity;
              return (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setSeverityFilter(active ? 'All' : severity)}
                  aria-pressed={active}
                  className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    active ? 'border-line-strong bg-elevated-hover' : 'border-line bg-elevated'
                  }`}
                  style={active ? { borderColor: config.color } : undefined}
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                    {severity}
                  </span>
                  <span className="mt-1 block text-2xl font-bold text-ink tabular-nums">{report.counts[severity]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 lg:flex-col">
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRescan}>
            Rescan
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={exportJson}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Findings */}
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Vulnerability details &amp; recommendations</h3>
            <p className="text-xs text-muted">Sample findings generated for demonstration purposes only.</p>
          </div>
          <SegmentedControl
            size="sm"
            ariaLabel="Filter findings by severity"
            options={filterOptions}
            value={severityFilter}
            onChange={setSeverityFilter}
          />
        </div>

        {visibleFindings.length === 0 ? (
          <EmptyState
            compact
            icon={FileSearch}
            title={`No ${severityFilter.toLowerCase()} findings`}
            description="This simulated report has no findings at that severity."
            action={
              <Button variant="secondary" size="sm" onClick={() => setSeverityFilter('All')}>
                Show all findings
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {visibleFindings.map((finding) => (
              <FindingItem
                key={finding.id}
                finding={finding}
                expanded={expandedId === finding.id}
                onToggle={() => setExpandedId((current) => (current === finding.id ? null : finding.id))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
