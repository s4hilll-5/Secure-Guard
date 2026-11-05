import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  Download,
  FilterX,
  Inbox,
  RotateCcw,
  Search,
  SearchX,
  ShieldAlert,
  TimerReset,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ALERT_STATUSES, SEVERITIES, SEVERITY_CONFIG } from '../data/constants';
import { alertsToCsv } from '../utils/reports';
import { downloadFile, fileDateStamp } from '../utils/download';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/Modal';
import AlertsTable from '../components/alerts/AlertsTable';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';

const PAGE_SIZE = 8;

const SORTERS = {
  newest: (a, b) => new Date(b.detectedAt) - new Date(a.detectedAt),
  oldest: (a, b) => new Date(a.detectedAt) - new Date(b.detectedAt),
  severity: (a, b) =>
    SEVERITY_CONFIG[b.severity].weight - SEVERITY_CONFIG[a.severity].weight ||
    new Date(b.detectedAt) - new Date(a.detectedAt),
};

export default function Alerts() {
  const { alerts, resolveAlert, setAlertStatus, deleteAlert, restoreSampleAlerts } = useApp();
  const toast = useToast();

  // The search term lives in the URL (?search=) so the top-bar search and
  // notification links can deep-link into a filtered alert list.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const setSearch = (value) => {
    setSearchParams(value ? { search: value } : {}, { replace: true });
    setPage(1);
  };

  // Apply search -> severity -> status filters, then sort.
  const filteredAlerts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return alerts
      .filter((alert) =>
        term
          ? `${alert.id} ${alert.title} ${alert.asset} ${alert.category} ${alert.source}`.toLowerCase().includes(term)
          : true,
      )
      .filter((alert) => severityFilter === 'All' || alert.severity === severityFilter)
      .filter((alert) => statusFilter === 'All' || alert.status === statusFilter)
      .sort(SORTERS[sortBy]);
  }, [alerts, search, severityFilter, statusFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount); // stays valid after deletions
  const pageAlerts = filteredAlerts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      Open: alerts.filter((a) => a.status === 'Open').length,
      Investigating: alerts.filter((a) => a.status === 'Investigating').length,
      Resolved: alerts.filter((a) => a.status === 'Resolved').length,
      criticalOpen: alerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length,
      bySeverity: Object.fromEntries(SEVERITIES.map((s) => [s, alerts.filter((a) => a.severity === s).length])),
    }),
    [alerts],
  );

  const hasActiveFilters = search || severityFilter !== 'All' || statusFilter !== 'All';
  const selectedAlert = alerts.find((alert) => alert.id === selectedId) ?? null;

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('All');
    setStatusFilter('All');
  };

  /* ---------- actions ---------- */
  const handleResolve = (alert) => {
    resolveAlert(alert.id);
    toast.success(`${alert.id} marked as resolved`);
  };

  const handleInvestigate = (alert) => {
    setAlertStatus(alert.id, 'Investigating');
    toast.info(`${alert.id} is now under investigation`);
  };

  const confirmDelete = () => {
    deleteAlert(pendingDelete.id);
    toast.success(`${pendingDelete.id} deleted`);
    if (selectedId === pendingDelete.id) setSelectedId(null);
    setPendingDelete(null);
  };

  const exportCsv = () => {
    downloadFile(alertsToCsv(filteredAlerts), `secureguard-alerts-${fileDateStamp()}.csv`, 'text/csv');
    toast.success(`Exported ${filteredAlerts.length} alert${filteredAlerts.length === 1 ? '' : 's'} to CSV`);
  };

  const severityOptions = [
    { value: 'All', label: 'All', count: alerts.length },
    ...SEVERITIES.map((severity) => ({ value: severity, label: severity, count: counts.bySeverity[severity] })),
  ];

  return (
    <>
      <PageHeader
        title="Security Alerts"
        description="Search, filter and triage alerts raised by your monitoring sources. Resolve issues once remediated or delete false positives."
        actions={
          <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={filteredAlerts.length === 0}>
            Export CSV
          </Button>
        }
      />

      {/* Status summary - click a tile to filter by that status */}
      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { status: 'Open', label: 'Open alerts', value: counts.Open, icon: ShieldAlert, color: '#ef4444' },
          {
            status: 'Investigating',
            label: 'Investigating',
            value: counts.Investigating,
            icon: TimerReset,
            color: '#eab308',
          },
          { status: 'Resolved', label: 'Resolved', value: counts.Resolved, icon: CheckCircle2, color: '#22c55e' },
          {
            status: null,
            label: 'Critical (unresolved)',
            value: counts.criticalOpen,
            icon: AlertOctagon,
            color: '#f97316',
          },
        ].map((tile, index) => (
          <button
            key={tile.label}
            type="button"
            className="text-left"
            onClick={() => {
              if (tile.status) {
                setStatusFilter(statusFilter === tile.status ? 'All' : tile.status);
                setSeverityFilter('All');
              } else {
                setSeverityFilter('Critical');
                setStatusFilter('All');
              }
              setPage(1);
            }}
          >
            <StatCard
              label={tile.label}
              value={tile.value}
              icon={tile.icon}
              iconColor={tile.color}
              delay={index * 60}
            />
          </button>
        ))}
      </div>

      <section className="glass-card animate-fade-up">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, ID, asset, category or source..."
                aria-label="Search alerts"
                className="input-base pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="input-base w-full cursor-pointer lg:w-44"
              >
                <option value="All">All statuses</option>
                {ALERT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status} ({counts[status]})
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort alerts"
                className="input-base w-full cursor-pointer lg:w-44"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="severity">Highest severity</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-full overflow-x-auto">
              <SegmentedControl
                ariaLabel="Filter by severity"
                options={severityOptions}
                value={severityFilter}
                onChange={(value) => {
                  setSeverityFilter(value);
                  setPage(1);
                }}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>
                <span className="font-semibold text-ink">{filteredAlerts.length}</span> result
                {filteredAlerts.length === 1 ? '' : 's'}
              </span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" icon={FilterX} onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content: empty states or the table */}
        {alerts.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No alerts available"
            description="There are no security alerts in your workspace. New alerts from your monitoring sources will appear here."
            action={
              <Button
                variant="secondary"
                icon={RotateCcw}
                onClick={() => {
                  restoreSampleAlerts();
                  toast.success('Sample alerts restored');
                }}
              >
                Restore sample alerts
              </Button>
            }
          />
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No alerts match your filters"
            description="Try a different search term or clear the filters to see all alerts."
            action={
              <Button variant="secondary" icon={FilterX} onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <AlertsTable
              alerts={pageAlerts}
              onSelect={(alert) => setSelectedId(alert.id)}
              onResolve={handleResolve}
              onDelete={setPendingDelete}
            />
            <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filteredAlerts.length} onPageChange={setPage} />
          </>
        )}
      </section>

      <AlertDetailsModal
        alert={selectedAlert}
        onClose={() => setSelectedId(null)}
        onResolve={handleResolve}
        onInvestigate={handleInvestigate}
        onDelete={setPendingDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete alert?"
        message={
          pendingDelete
            ? `"${pendingDelete.title}" (${pendingDelete.id}) will be permanently removed from the alert list.`
            : ''
        }
        confirmLabel="Delete alert"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
