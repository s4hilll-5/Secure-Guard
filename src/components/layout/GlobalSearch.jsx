import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Globe, Search, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from '../../data/navigation';
import useClickOutside from '../../hooks/useClickOutside';
import { SeverityBadge } from '../ui/Badges';

const MAX_PER_GROUP = 4;

/**
 * Top-bar search across pages, alerts and scan history.
 * - Type to see grouped results, click one to jump to it.
 * - Enter opens the first result (or searches alerts for the term).
 * - Ctrl/Cmd + K focuses the field from anywhere.
 */
export default function GlobalSearch({ autoFocus = false, onNavigate }) {
  const { alerts, scanHistory } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const term = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return { pages: [], alerts: [], scans: [] };
    return {
      pages: NAV_ITEMS.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(term)).slice(
        0,
        MAX_PER_GROUP,
      ),
      alerts: alerts
        .filter((alert) => `${alert.id} ${alert.title} ${alert.asset} ${alert.category}`.toLowerCase().includes(term))
        .slice(0, MAX_PER_GROUP),
      scans: scanHistory.filter((scan) => scan.host.toLowerCase().includes(term)).slice(0, MAX_PER_GROUP),
    };
  }, [term, alerts, scanHistory]);

  const flatResults = [
    ...results.pages.map((page) => page.path),
    ...results.alerts.map((alert) => `/alerts?search=${encodeURIComponent(alert.id)}`),
    ...results.scans.map((scan) => `/scanner?scan=${encodeURIComponent(scan.id)}`),
  ];

  const go = (path) => {
    navigate(path);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    onNavigate?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!term) return;
    go(flatResults[0] ?? `/alerts?search=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = flatResults.length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>
      <form onSubmit={handleSubmit} role="search">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search alerts, assets, scans..."
          aria-label="Search"
          className="input-base h-10 pr-16 pl-10"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line bg-surface-solid px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:block">
          Ctrl K
        </kbd>
      </form>

      {open && term && (
        <div className="animate-fade-up absolute inset-x-0 top-12 z-50 max-h-[420px] overflow-y-auto rounded-2xl border border-line-strong bg-surface-solid p-2 shadow-2xl shadow-black/40">
          {!hasResults && (
            <button
              type="button"
              onClick={() => go(`/alerts?search=${encodeURIComponent(query.trim())}`)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted hover:bg-elevated"
            >
              <Search className="h-4 w-4" />
              No direct matches - search alerts for &ldquo;
              <span className="font-semibold text-ink">{query.trim()}</span>&rdquo;
            </button>
          )}

          {results.pages.length > 0 && (
            <ResultGroup title="Pages">
              {results.pages.map(({ path, label, description, icon: Icon }) => (
                <ResultButton key={path} onClick={() => go(path)} icon={Icon} title={label} subtitle={description} />
              ))}
            </ResultGroup>
          )}

          {results.alerts.length > 0 && (
            <ResultGroup title="Alerts">
              {results.alerts.map((alert) => (
                <ResultButton
                  key={alert.id}
                  onClick={() => go(`/alerts?search=${encodeURIComponent(alert.id)}`)}
                  icon={ShieldAlert}
                  title={alert.title}
                  subtitle={`${alert.id} · ${alert.asset}`}
                  trailing={<SeverityBadge severity={alert.severity} size="sm" />}
                />
              ))}
            </ResultGroup>
          )}

          {results.scans.length > 0 && (
            <ResultGroup title="Scan history">
              {results.scans.map((scan) => (
                <ResultButton
                  key={scan.id}
                  onClick={() => go(`/scanner?scan=${encodeURIComponent(scan.id)}`)}
                  icon={Globe}
                  title={scan.host}
                  subtitle={`Score ${scan.score}/100 · simulated`}
                />
              ))}
            </ResultGroup>
          )}

          {hasResults && (
            <p className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] text-subtle">
              <CornerDownLeft className="h-3 w-3" /> Press Enter to open the first result
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, children }) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-subtle uppercase">{title}</p>
      {children}
    </div>
  );
}

function ResultButton({ icon: Icon, title, subtitle, trailing, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-elevated"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{title}</span>
        <span className="block truncate text-xs text-subtle">{subtitle}</span>
      </span>
      {trailing}
    </button>
  );
}
