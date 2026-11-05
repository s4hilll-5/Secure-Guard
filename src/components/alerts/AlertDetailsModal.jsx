import { CheckCircle2, Search, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/time';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { SeverityBadge, StatusBadge } from '../ui/Badges';

/** Full details for a single alert, with status actions. */
export default function AlertDetailsModal({ alert, onClose, onResolve, onInvestigate, onDelete }) {
  if (!alert) return null;
  const isResolved = alert.status === 'Resolved';

  const details = [
    ['Alert ID', <span className="font-mono">{alert.id}</span>],
    ['Category', alert.category],
    ['Affected asset', <span className="font-mono break-all">{alert.asset}</span>],
    ['Detection source', alert.source],
    ['Detected', formatDateTime(alert.detectedAt)],
    ['Resolved', alert.resolvedAt ? formatDateTime(alert.resolvedAt) : '-'],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Alert details"
      maxWidth="max-w-xl"
      footer={
        <div className="flex w-full flex-wrap justify-between gap-2">
          <Button variant="danger" icon={Trash2} onClick={() => onDelete(alert)}>
            Delete
          </Button>
          <div className="flex flex-wrap gap-2">
            {alert.status === 'Open' && (
              <Button variant="secondary" icon={Search} onClick={() => onInvestigate(alert)}>
                Investigate
              </Button>
            )}
            <Button variant="success" icon={CheckCircle2} disabled={isResolved} onClick={() => onResolve(alert)}>
              {isResolved ? 'Resolved' : 'Mark resolved'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <SeverityBadge severity={alert.severity} />
        <StatusBadge status={alert.status} />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-ink">{alert.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{alert.description}</p>

      <dl className="mt-5 grid gap-x-6 gap-y-4 rounded-xl border border-line bg-elevated p-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold tracking-wide text-subtle uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
