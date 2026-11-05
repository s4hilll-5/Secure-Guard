import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

/** "Showing 1-10 of 24" + previous / next buttons. */
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 text-sm sm:flex-row">
      <p className="text-muted">
        Showing{' '}
        <span className="font-semibold text-ink">
          {from}-{to}
        </span>{' '}
        of <span className="font-semibold text-ink">{total}</span> alerts
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="px-2 text-xs text-subtle tabular-nums">
          Page {page} / {pageCount}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
