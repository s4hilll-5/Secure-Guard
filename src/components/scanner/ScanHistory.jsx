import { useState } from 'react';
import { Eye, History, Trash2 } from 'lucide-react';
import { SEVERITIES, SEVERITY_CONFIG, getScoreRating } from '../../data/constants';
import { formatRelativeTime } from '../../utils/time';
import Card from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/Modal';

/** Table of previous simulated scans with view / delete / clear actions. */
export default function ScanHistory({ scans, activeId, onView, onDelete, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Card
      title="Scan History"
      subtitle={`${scans.length} saved scan${scans.length === 1 ? '' : 's'} · stored in your browser`}
      icon={History}
      action={
        scans.length > 0 && (
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmClear(true)}>
            Clear history
          </Button>
        )
      }
      bodyClassName="px-0! pb-0!"
    >
      {scans.length === 0 ? (
        <EmptyState
          compact
          icon={History}
          title="No scans yet"
          description="Your simulated scans will be listed here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs font-semibold tracking-wide text-subtle uppercase">
                <th className="px-6 py-3">Website</th>
                <th className="px-4 py-3">Scanned</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Findings</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scans.map((scan) => {
                const rating = getScoreRating(scan.score);
                const isActive = scan.id === activeId;
                return (
                  <tr key={scan.id} className={`transition hover:bg-elevated ${isActive ? 'bg-primary/[0.05]' : ''}`}>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-ink">{scan.host}</p>
                      <p className="font-mono text-[11px] text-subtle">{scan.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{formatRelativeTime(scan.scannedAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-ink tabular-nums">{scan.score}</span>
                      <span className="ml-1.5 text-xs font-medium" style={{ color: rating.color }}>
                        {rating.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        {SEVERITIES.map((severity) => (
                          <span
                            key={severity}
                            title={`${scan.counts[severity]} ${severity}`}
                            className="inline-flex min-w-7 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                            style={{
                              color: SEVERITY_CONFIG[severity].color,
                              background: `color-mix(in srgb, ${SEVERITY_CONFIG[severity].color} 12%, transparent)`,
                            }}
                          >
                            {severity[0]}:{scan.counts[severity]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="secondary" size="sm" icon={Eye} onClick={() => onView(scan)}>
                          {isActive ? 'Viewing' : 'View'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={Trash2}
                          onClick={() => onDelete(scan)}
                          aria-label={`Delete scan of ${scan.host}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear scan history?"
        message="All saved simulated scans will be removed from this browser. This cannot be undone."
        confirmLabel="Clear history"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          onClear();
          setConfirmClear(false);
        }}
      />
    </Card>
  );
}
