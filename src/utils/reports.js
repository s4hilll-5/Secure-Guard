/**
 * Builders for the downloadable sample reports (CSV + standalone HTML).
 */
import { SEVERITIES, SEVERITY_CONFIG } from '../data/constants';
import { formatDateTime } from './time';

/** Escape a value for CSV (wrap in quotes, double any inner quotes). */
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function alertsToCsv(alerts) {
  const header = ['ID', 'Title', 'Severity', 'Status', 'Category', 'Asset', 'Source', 'Detected', 'Resolved'];
  const rows = alerts.map((alert) => [
    alert.id,
    alert.title,
    alert.severity,
    alert.status,
    alert.category,
    alert.asset,
    alert.source,
    formatDateTime(alert.detectedAt),
    alert.resolvedAt ? formatDateTime(alert.resolvedAt) : '',
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

/** Escape text for safe insertion into the generated HTML document. */
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Build a self-contained HTML security report that opens in any browser
 * and can be printed / saved as PDF.
 */
export function buildHtmlReport({ alerts, scans, weekly, performance, score, profile }) {
  const bySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, alerts.filter((a) => a.severity === s).length]));
  const resolved = alerts.filter((a) => a.status === 'Resolved').length;
  const open = alerts.length - resolved;
  const total = alerts.length || 1;
  const avgScanScore = scans.length ? Math.round(scans.reduce((sum, s) => sum + s.score, 0) / scans.length) : '-';
  const weeklyDetected = weekly.reduce((sum, d) => sum + d.detected, 0);
  const weeklyResolved = weekly.reduce((sum, d) => sum + d.resolved, 0);

  const severityRows = SEVERITIES.map(
    (s) => `
      <tr>
        <td><span class="dot" style="background:${SEVERITY_CONFIG[s].color}"></span>${s}</td>
        <td>${bySeverity[s]}</td>
        <td><div class="bar"><span style="width:${(bySeverity[s] / total) * 100}%;background:${SEVERITY_CONFIG[s].color}"></span></div></td>
      </tr>`,
  ).join('');

  const openAlertRows = alerts
    .filter((a) => a.status !== 'Resolved')
    .map(
      (a) => `
      <tr>
        <td class="mono">${escapeHtml(a.id)}</td>
        <td>${escapeHtml(a.title)}</td>
        <td><span class="pill" style="color:${SEVERITY_CONFIG[a.severity].color};border-color:${SEVERITY_CONFIG[a.severity].color}">${a.severity}</span></td>
        <td>${escapeHtml(a.status)}</td>
        <td class="mono">${escapeHtml(a.asset)}</td>
      </tr>`,
    )
    .join('');

  const performanceRows = performance
    .map(
      (p) =>
        `<tr><td>${escapeHtml(p.area)}</td><td>${p.score}/100</td><td><div class="bar"><span style="width:${p.score}%;background:#3b82f6"></span></div></td></tr>`,
    )
    .join('');

  const scanRows = scans
    .slice(0, 10)
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.host)}</td><td>${formatDateTime(s.scannedAt)}</td><td>${s.score}/100</td><td>${s.findings.length}</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SecureGuard Security Report</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; color: #0f172a; background: #f1f5f9; }
  .page { max-width: 900px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,.08); }
  header { background: linear-gradient(120deg, #0b1120, #1e2a4a); color: #fff; padding: 32px 40px; }
  header h1 { margin: 0 0 4px; font-size: 26px; }
  header p { margin: 0; color: #94a3b8; font-size: 13px; }
  .notice { margin: 24px 40px 0; padding: 12px 16px; border-radius: 10px; background: #f5f3ff; color: #5b21b6; font-size: 13px; border: 1px solid #ddd6fe; }
  section { padding: 24px 40px; }
  h2 { font-size: 16px; margin: 0 0 14px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
  .kpi span { display: block; font-size: 12px; color: #64748b; }
  .kpi strong { font-size: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; padding: 8px; border-bottom: 1px solid #e2e8f0; }
  td { padding: 9px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  .mono { font-family: Consolas, monospace; font-size: 12px; color: #475569; }
  .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; }
  .bar { height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; min-width: 120px; }
  .bar span { display: block; height: 100%; border-radius: 99px; }
  .pill { font-size: 11px; font-weight: 600; border: 1px solid; border-radius: 99px; padding: 2px 8px; }
  footer { padding: 18px 40px 28px; font-size: 12px; color: #94a3b8; }
  @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; } }
  @media (max-width: 640px) { .kpis { grid-template-columns: repeat(2, 1fr); } section, header { padding-left: 20px; padding-right: 20px; } .notice { margin-left: 20px; margin-right: 20px; } }
</style>
</head>
<body>
<div class="page">
  <header>
    <h1>SecureGuard Security Report</h1>
    <p>Generated ${formatDateTime(new Date().toISOString())} for ${escapeHtml(profile.fullName)} · ${escapeHtml(profile.company)}</p>
  </header>
  <div class="notice"><strong>Sample report.</strong> All figures are simulated demo data from the SecureGuard frontend demonstration. No real systems were scanned.</div>
  <section>
    <h2>Executive summary</h2>
    <div class="kpis">
      <div class="kpi"><span>Security score</span><strong>${score}/100</strong></div>
      <div class="kpi"><span>Total vulnerabilities</span><strong>${alerts.length}</strong></div>
      <div class="kpi"><span>Open issues</span><strong>${open}</strong></div>
      <div class="kpi"><span>Resolved</span><strong>${resolved}</strong></div>
      <div class="kpi"><span>Total scans</span><strong>${scans.length}</strong></div>
      <div class="kpi"><span>Avg. scan score</span><strong>${avgScanScore}</strong></div>
      <div class="kpi"><span>Detected this week</span><strong>${weeklyDetected}</strong></div>
      <div class="kpi"><span>Resolved this week</span><strong>${weeklyResolved}</strong></div>
    </div>
  </section>
  <section>
    <h2>Vulnerability distribution</h2>
    <table><thead><tr><th>Severity</th><th>Count</th><th>Share</th></tr></thead><tbody>${severityRows}</tbody></table>
  </section>
  <section>
    <h2>Security performance by area</h2>
    <table><thead><tr><th>Area</th><th>Score</th><th></th></tr></thead><tbody>${performanceRows}</tbody></table>
  </section>
  <section>
    <h2>Open alerts (${open})</h2>
    ${open ? `<table><thead><tr><th>ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Asset</th></tr></thead><tbody>${openAlertRows}</tbody></table>` : '<p>No open alerts.</p>'}
  </section>
  <section>
    <h2>Recent scans</h2>
    ${scans.length ? `<table><thead><tr><th>Website</th><th>Date</th><th>Score</th><th>Findings</th></tr></thead><tbody>${scanRows}</tbody></table>` : '<p>No scans recorded.</p>'}
  </section>
  <footer>SecureGuard · Frontend demonstration project · Simulated sample data</footer>
</div>
</body>
</html>`;
}
