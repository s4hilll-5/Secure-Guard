import { SEVERITY_CONFIG } from '../../data/constants';
import { formatDateTime, formatRelativeTime } from '../../utils/time';
import { SeverityBadge, StatusBadge } from '../ui/Badges';
import AlertActions from './AlertActions';

/**
 * Alert list: a full table on md+ screens and stacked cards on mobile.
 * Clicking a row opens the details dialog.
 */
export default function AlertsTable({ alerts, onSelect, onResolve, onDelete }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-subtle uppercase">
              <th className="px-6 py-3">Alert</th>
              <th className="px-4 py-3">Severity</th>
              <th className="hidden px-4 py-3 lg:table-cell">Asset</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 2xl:table-cell">Detected</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                onClick={() => onSelect(alert)}
                className={`cursor-pointer transition hover:bg-elevated ${alert.status === 'Resolved' ? 'opacity-70' : ''}`}
              >
                <td className="max-w-sm px-6 py-3.5 2xl:max-w-md">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SEVERITY_CONFIG[alert.severity].color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{alert.title}</p>
                      <p className="mt-0.5 truncate text-xs text-subtle">
                        <span className="font-mono">{alert.id}</span> · {alert.category}
                        <span className="lg:hidden"> · {alert.asset}</span>
                        <span className="2xl:hidden"> · {formatRelativeTime(alert.detectedAt)}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <SeverityBadge severity={alert.severity} size="sm" />
                </td>
                <td className="hidden px-4 py-3.5 lg:table-cell">
                  <p className="max-w-40 truncate font-mono text-xs text-muted">{alert.asset}</p>
                  <p className="max-w-40 truncate text-[11px] text-subtle">{alert.source}</p>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={alert.status} />
                </td>
                <td
                  className="hidden px-4 py-3.5 text-xs text-muted 2xl:table-cell"
                  title={formatDateTime(alert.detectedAt)}
                >
                  {formatRelativeTime(alert.detectedAt)}
                </td>
                <td className="px-6 py-3.5">
                  <AlertActions alert={alert} onResolve={onResolve} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {alerts.map((alert) => (
          <li key={alert.id} className="px-4 py-4" onClick={() => onSelect(alert)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{alert.title}</p>
                <p className="mt-0.5 text-xs text-subtle">
                  <span className="font-mono">{alert.id}</span> · {alert.asset} · {formatRelativeTime(alert.detectedAt)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={alert.severity} size="sm" />
                <StatusBadge status={alert.status} />
              </div>
              <AlertActions alert={alert} onResolve={onResolve} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
