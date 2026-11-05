import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Bug,
  CheckCircle2,
  FileText,
  Globe,
  KeyRound,
  LogIn,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SECURITY_SCORE, WEEKLY_ACTIVITY } from '../data/sampleData';
import { SEVERITY_CONFIG, getScoreRating } from '../data/constants';
import { countBySeverity } from '../data/scanSimulator';
import useSimulatedLoading from '../hooks/useSimulatedLoading';
import { formatRelativeTime } from '../utils/time';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ScoreGauge from '../components/ui/ScoreGauge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton, { ChartSkeleton } from '../components/ui/Skeleton';
import { SeverityBadge, StatusBadge } from '../components/ui/Badges';
import SeverityDonutChart from '../components/charts/SeverityDonutChart';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';

/** Icon + colour per activity type in the "Recent Security Activity" feed. */
const ACTIVITY_STYLES = {
  alert: { icon: ShieldAlert, color: '#ef4444' },
  scan: { icon: Radar, color: 'var(--sg-primary)' },
  resolved: { icon: CheckCircle2, color: '#22c55e' },
  policy: { icon: KeyRound, color: 'var(--sg-accent)' },
  login: { icon: LogIn, color: '#38bdf8' },
  report: { icon: FileText, color: '#eab308' },
  deleted: { icon: Trash2, color: '#94a3b8' },
};

/** Supporting posture metrics shown under the score gauge. */
const POSTURE_METRICS = [
  { label: 'Patch compliance', value: 92 },
  { label: 'MFA coverage', value: 88 },
  { label: 'Endpoint protection', value: 96 },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Overview() {
  const { alerts, activity, scanHistory, settings, resolveAlert } = useApp();
  const toast = useToast();
  const loading = useSimulatedLoading();

  // All headline numbers are derived from the alert list, so they update
  // immediately when an alert is resolved or deleted on the Alerts page.
  const stats = useMemo(() => {
    const resolved = alerts.filter((alert) => alert.status === 'Resolved').length;
    return {
      total: alerts.length,
      open: alerts.length - resolved,
      critical: alerts.filter((alert) => alert.severity === 'Critical' && alert.status !== 'Resolved').length,
      resolved,
      resolutionRate: alerts.length ? Math.round((resolved / alerts.length) * 100) : 0,
      bySeverity: countBySeverity(alerts),
    };
  }, [alerts]);

  const latestAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => alert.status !== 'Resolved')
        .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
        .slice(0, 5),
    [alerts],
  );

  const firstName = settings.profile.fullName.split(' ')[0];
  const scoreDelta = SECURITY_SCORE.current - SECURITY_SCORE.previous;

  const handleResolve = (alert) => {
    resolveAlert(alert.id);
    toast.success(`${alert.id} marked as resolved`);
  };

  return (
    <>
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        description="Here is the current security posture of your organisation and the latest activity across monitored assets."
        actions={
          <>
            <Button to="/reports" variant="secondary" icon={FileText}>
              View reports
            </Button>
            <Button to="/scanner" icon={Radar}>
              New scan
            </Button>
          </>
        }
      />

      {/* ---------- Row 1: score + KPIs + weekly chart ---------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          title="Overall Security Score"
          subtitle="Weighted across all monitored assets"
          icon={ShieldCheck}
          className="lg:row-span-2"
        >
          <div className="flex flex-col items-center">
            <ScoreGauge score={SECURITY_SCORE.current} />
            <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-semibold text-success">+{scoreDelta} pts</span> since last week
            </p>
          </div>
          <ul className="mt-6 space-y-4">
            {POSTURE_METRICS.map((metric) => (
              <li key={metric.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-muted">{metric.label}</span>
                  <span className="font-semibold text-ink tabular-nums">{metric.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-accent"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-line bg-elevated p-3 text-xs leading-relaxed text-muted">
            Rating:{' '}
            <span className="font-semibold" style={{ color: getScoreRating(SECURITY_SCORE.current).color }}>
              {getScoreRating(SECURITY_SCORE.current).label}
            </span>
            . Resolving the {stats.critical} open critical issue{stats.critical === 1 ? '' : 's'} is the fastest way to
            raise the score.
          </p>
        </Card>

        <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
          <StatCard
            label="Total Vulnerabilities"
            value={stats.total}
            icon={Bug}
            iconColor="var(--sg-primary)"
            hint={`${stats.open} currently open`}
            delay={60}
          />
          <StatCard
            label="Critical Issues"
            value={stats.critical}
            icon={AlertOctagon}
            iconColor="#ef4444"
            hint={stats.critical ? 'Require immediate action' : 'No open critical issues'}
            delay={120}
          />
          <StatCard
            label="Resolved Issues"
            value={stats.resolved}
            icon={CheckCircle2}
            iconColor="#22c55e"
            trend={`${stats.resolutionRate}%`}
            trendPositive
            hint="resolution rate"
            delay={180}
          />
        </div>

        <Card
          title="Weekly Security Activity"
          subtitle="Vulnerabilities detected vs resolved, last 7 days"
          icon={Activity}
          className="lg:col-span-2"
        >
          {loading ? <ChartSkeleton height={262} /> : <WeeklyActivityChart data={WEEKLY_ACTIVITY} height={230} />}
        </Card>
      </div>

      {/* ---------- Row 2: distribution + latest alerts ---------- */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Vulnerability Distribution" subtitle="All tracked issues by severity" icon={Bug}>
          {loading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="h-44 w-44 rounded-full" />
              <div className="flex-1 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            </div>
          ) : (
            <SeverityDonutChart counts={stats.bySeverity} height={200} />
          )}
        </Card>

        <Card
          title="Latest Security Alerts"
          subtitle="Most recent unresolved alerts"
          icon={ShieldAlert}
          className="lg:col-span-2"
          action={
            <Link to="/alerts" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName="px-0! pb-2!"
        >
          {loading ? (
            <div className="space-y-3 px-6 pb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : latestAlerts.length === 0 ? (
            <EmptyState
              compact
              icon={ShieldCheck}
              title="No open alerts"
              description="Everything has been triaged. Nice work!"
            />
          ) : (
            <ul className="divide-y divide-line">
              {latestAlerts.map((alert) => {
                const SeverityIcon = SEVERITY_CONFIG[alert.severity].icon;
                return (
                  <li key={alert.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-elevated sm:px-6">
                    <span
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex"
                      style={{
                        color: SEVERITY_CONFIG[alert.severity].color,
                        background: `color-mix(in srgb, ${SEVERITY_CONFIG[alert.severity].color} 12%, transparent)`,
                      }}
                    >
                      <SeverityIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/alerts?search=${alert.id}`}
                        className="block truncate text-sm font-semibold text-ink hover:text-primary"
                      >
                        {alert.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-subtle">
                        <span className="font-mono">{alert.id}</span> · {alert.asset} ·{' '}
                        {formatRelativeTime(alert.detectedAt)}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <SeverityBadge severity={alert.severity} size="sm" />
                    </div>
                    <div className="hidden xl:block">
                      <StatusBadge status={alert.status} />
                    </div>
                    <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => handleResolve(alert)}>
                      <span className="hidden sm:inline">Resolve</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ---------- Row 3: activity feed + recent scans ---------- */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="Recent Security Activity"
          subtitle="Events and actions across your workspace"
          icon={Activity}
          className="lg:col-span-2"
        >
          {activity.length === 0 ? (
            <EmptyState
              compact
              icon={Activity}
              title="No activity yet"
              description="Actions you take will be logged here."
            />
          ) : (
            <ol className="relative space-y-1">
              {activity.slice(0, 7).map((event, index) => {
                const style = ACTIVITY_STYLES[event.type] ?? ACTIVITY_STYLES.policy;
                const Icon = style.icon;
                const isLast = index === Math.min(activity.length, 7) - 1;
                return (
                  <li key={event.id} className="relative flex gap-4 pb-3">
                    {!isLast && <span className="absolute top-9 bottom-0 left-[17px] w-px bg-line" />}
                    <span
                      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-solid"
                      style={{ color: style.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm text-ink">{event.message}</p>
                      <p className="mt-0.5 text-xs text-subtle">{formatRelativeTime(event.time)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <Card
          title="Recent Scans"
          subtitle="Simulated website scans"
          icon={Radar}
          action={
            <Link to="/scanner" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Scanner <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {scanHistory.length === 0 ? (
            <EmptyState
              compact
              icon={Globe}
              title="No scans yet"
              description="Run your first simulated scan."
              action={
                <Button to="/scanner" size="sm" icon={Radar}>
                  Start scan
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {scanHistory.slice(0, 5).map((scan) => {
                const rating = getScoreRating(scan.score);
                return (
                  <li key={scan.id}>
                    <Link
                      to={`/scanner?scan=${scan.id}`}
                      className="flex items-center gap-3 rounded-xl border border-line bg-elevated p-3 transition hover:border-line-strong hover:bg-elevated-hover"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Globe className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{scan.host}</span>
                        <span className="block text-xs text-subtle">
                          {scan.findings.length} findings · {formatRelativeTime(scan.scannedAt)}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-bold text-ink tabular-nums">{scan.score}</span>
                        <span className="block text-[11px] font-medium" style={{ color: rating.color }}>
                          {rating.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
