import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Gauge,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Radar,
  Table2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { PREVIOUS_WEEK_ACTIVITY, SECURITY_PERFORMANCE, SECURITY_SCORE, WEEKLY_ACTIVITY } from '../data/sampleData';
import { countBySeverity } from '../data/scanSimulator';
import useSimulatedLoading from '../hooks/useSimulatedLoading';
import { alertsToCsv, buildHtmlReport } from '../utils/reports';
import { downloadFile, fileDateStamp } from '../utils/download';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import SegmentedControl from '../components/ui/SegmentedControl';
import Skeleton, { ChartSkeleton } from '../components/ui/Skeleton';
import SeverityDonutChart from '../components/charts/SeverityDonutChart';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import PerformanceBarChart from '../components/charts/PerformanceBarChart';

const REPORT_FORMATS = [
  {
    value: 'html',
    label: 'HTML report',
    icon: FileCode2,
    description: 'Formatted report - open in a browser or print to PDF',
  },
  {
    value: 'csv',
    label: 'CSV export',
    icon: FileSpreadsheet,
    description: 'All alerts as a spreadsheet-friendly file',
  },
];

export default function Reports() {
  const { alerts, scanHistory, settings, logActivity } = useApp();
  const toast = useToast();
  const loading = useSimulatedLoading(700);

  const [weekRange, setWeekRange] = useState('current');
  const [weeklyView, setWeeklyView] = useState('chart');
  const [reportFormat, setReportFormat] = useState('html');
  const [generating, setGenerating] = useState(false);

  const weeklyData = weekRange === 'current' ? WEEKLY_ACTIVITY : PREVIOUS_WEEK_ACTIVITY;

  const metrics = useMemo(() => {
    const resolved = alerts.filter((a) => a.status === 'Resolved').length;
    const avgScore = scanHistory.length
      ? Math.round(scanHistory.reduce((sum, scan) => sum + scan.score, 0) / scanHistory.length)
      : 0;
    const findings = scanHistory.reduce((sum, scan) => sum + scan.findings.length, 0);
    return { resolved, avgScore, findings, bySeverity: countBySeverity(alerts) };
  }, [alerts, scanHistory]);

  const weeklyTotals = weeklyData.reduce(
    (totals, day) => ({ detected: totals.detected + day.detected, resolved: totals.resolved + day.resolved }),
    { detected: 0, resolved: 0 },
  );

  /** Generate the selected report format and trigger a download. */
  const handleDownload = () => {
    setGenerating(true);
    // Short delay so the "Generating..." state is visible, like a real export.
    window.setTimeout(() => {
      if (reportFormat === 'html') {
        const html = buildHtmlReport({
          alerts,
          scans: scanHistory,
          weekly: WEEKLY_ACTIVITY,
          performance: SECURITY_PERFORMANCE,
          score: SECURITY_SCORE.current,
          profile: settings.profile,
        });
        downloadFile(html, `secureguard-report-${fileDateStamp()}.html`, 'text/html');
      } else {
        downloadFile(alertsToCsv(alerts), `secureguard-alerts-${fileDateStamp()}.csv`, 'text/csv');
      }
      logActivity('report', `Sample ${reportFormat.toUpperCase()} report downloaded`);
      toast.success('Sample report downloaded');
      setGenerating(false);
    }, 900);
  };

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Trends and breakdowns across vulnerabilities, scans and security domains. Download a sample report to share with your team."
        actions={
          <Button icon={Download} onClick={handleDownload} loading={generating}>
            {generating ? 'Generating...' : 'Download sample report'}
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Scans"
          value={scanHistory.length}
          icon={Radar}
          hint={`${metrics.findings} sample findings`}
        />
        <StatCard
          label="Resolved Vulnerabilities"
          value={metrics.resolved}
          icon={CheckCircle2}
          iconColor="#22c55e"
          hint={`of ${alerts.length} tracked issues`}
          delay={60}
        />
        <StatCard
          label="Average Scan Score"
          value={scanHistory.length ? metrics.avgScore : '-'}
          icon={Gauge}
          iconColor="var(--sg-accent)"
          hint="across saved scans"
          delay={120}
        />
        <StatCard
          label="Mean Time to Resolve"
          value="4.2h"
          icon={Clock3}
          iconColor="#eab308"
          trend="-18%"
          trendPositive
          hint="vs last month"
          delay={180}
        />
      </div>

      {/* Distribution + weekly line chart */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Vulnerability Distribution" subtitle="Share of issues by severity" icon={PieChartIcon}>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="mx-auto h-48 w-48 rounded-full" />
              <Skeleton className="h-16" />
            </div>
          ) : (
            <SeverityDonutChart counts={metrics.bySeverity} height={210} stacked />
          )}
        </Card>

        <Card
          title="Weekly Activity"
          subtitle={`${weeklyTotals.detected} detected · ${weeklyTotals.resolved} resolved`}
          icon={LineChartIcon}
          className="lg:col-span-2"
          action={
            <div className="flex flex-wrap gap-2">
              <SegmentedControl
                size="sm"
                ariaLabel="Select week"
                value={weekRange}
                onChange={setWeekRange}
                options={[
                  { value: 'current', label: 'This week' },
                  { value: 'previous', label: 'Last week' },
                ]}
              />
              <SegmentedControl
                size="sm"
                ariaLabel="Chart or table view"
                value={weeklyView}
                onChange={setWeeklyView}
                options={[
                  { value: 'chart', label: <LineChartIcon className="h-3.5 w-3.5" aria-label="Chart view" /> },
                  { value: 'table', label: <Table2 className="h-3.5 w-3.5" aria-label="Table view" /> },
                ]}
              />
            </div>
          }
        >
          {loading ? (
            <ChartSkeleton height={300} />
          ) : weeklyView === 'chart' ? (
            <WeeklyActivityChart data={weeklyData} variant="line" height={300} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-subtle uppercase">
                    <th className="py-2.5 pr-4">Day</th>
                    <th className="py-2.5 pr-4 text-right">Detected</th>
                    <th className="py-2.5 pr-4 text-right">Resolved</th>
                    <th className="py-2.5 text-right">Net change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {weeklyData.map((day) => {
                    const net = day.detected - day.resolved;
                    return (
                      <tr key={day.day}>
                        <td className="py-2.5 pr-4 font-medium text-ink">{day.day}</td>
                        <td className="py-2.5 pr-4 text-right text-muted tabular-nums">{day.detected}</td>
                        <td className="py-2.5 pr-4 text-right text-muted tabular-nums">{day.resolved}</td>
                        <td
                          className={`py-2.5 text-right font-semibold tabular-nums ${net > 0 ? 'text-high' : 'text-success'}`}
                        >
                          {net > 0 ? `+${net}` : net}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Performance bar chart + report download */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="Security Performance"
          subtitle="Posture score by security domain (target 80)"
          icon={BarChart3}
          className="lg:col-span-2"
        >
          {loading ? <ChartSkeleton height={290} /> : <PerformanceBarChart data={SECURITY_PERFORMANCE} />}
        </Card>

        <Card title="Download Sample Report" subtitle="Generated in your browser from demo data" icon={FileText}>
          <fieldset className="space-y-2.5">
            <legend className="sr-only">Report format</legend>
            {REPORT_FORMATS.map(({ value, label, icon: Icon, description }) => {
              const checked = reportFormat === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    checked ? 'border-primary bg-primary-soft' : 'border-line bg-elevated hover:border-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-format"
                    value={value}
                    checked={checked}
                    onChange={() => setReportFormat(value)}
                    className="sr-only"
                  />
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? 'text-primary' : 'text-subtle'}`} />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{label}</span>
                    <span className="block text-xs text-muted">{description}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <ul className="mt-4 space-y-1.5 text-xs text-muted">
            {[
              'Executive summary & KPIs',
              'Severity distribution',
              'Performance by domain',
              'Open alerts & recent scans',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {item}
              </li>
            ))}
          </ul>

          <Button className="mt-5 w-full" icon={Download} onClick={handleDownload} loading={generating}>
            {generating ? 'Generating...' : `Download ${reportFormat.toUpperCase()}`}
          </Button>
          <p className="mt-2 text-center text-[11px] text-subtle">Contains simulated sample data only.</p>
        </Card>
      </div>
    </>
  );
}
