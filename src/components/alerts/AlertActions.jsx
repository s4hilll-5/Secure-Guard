import { CheckCircle2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

/** Resolve + Delete buttons shared by the table rows, mobile cards and details dialog. */
export default function AlertActions({ alert, onResolve, onDelete, showLabels = false }) {
  const isResolved = alert.status === 'Resolved';
  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
      <Button
        variant="success"
        size="sm"
        icon={CheckCircle2}
        disabled={isResolved}
        onClick={() => onResolve(alert)}
        aria-label={`Resolve ${alert.id}`}
        title={isResolved ? 'Already resolved' : 'Mark as resolved'}
      >
        {isResolved ? 'Resolved' : 'Resolve'}
      </Button>
      <Button
        variant="danger"
        size="sm"
        icon={Trash2}
        onClick={() => onDelete(alert)}
        aria-label={`Delete ${alert.id}`}
        title="Delete alert"
      >
        {showLabels && 'Delete'}
      </Button>
    </div>
  );
}
