/**
 * Sample (demo) data for SecureGuard.
 * Timestamps are generated relative to "now" the first time the app loads,
 * so the dashboard always looks fresh. Everything is then persisted to
 * LocalStorage and can be reset from Settings -> Demo data.
 */
import { minutesAgo } from '../utils/time';
import { generateScanReport } from './scanSimulator';

/** Headline score for the organisation (shown on the Overview page). */
export const SECURITY_SCORE = {
  current: 85,
  previous: 81,
};

/** Factory functions return fresh copies, so "reset" always restores pristine data. */
export const createSampleAlerts = () => [
  {
    id: 'ALT-1048',
    title: 'Brute-force login attempts on admin portal',
    description:
      '1,240 failed sign-in attempts from 37 IP addresses in 15 minutes against the admin portal. Source IPs have been temporarily rate-limited by the WAF.',
    severity: 'Critical',
    status: 'Open',
    asset: 'admin.acme.internal',
    category: 'Authentication',
    source: 'Web Application Firewall',
    detectedAt: minutesAgo(12),
  },
  {
    id: 'ALT-1047',
    title: 'Publicly readable cloud storage bucket',
    description:
      'Storage bucket "acme-finance-exports" allows anonymous read access. 312 objects, including CSV exports, are exposed.',
    severity: 'Critical',
    status: 'Open',
    asset: 'cloud-storage/finance-exports',
    category: 'Cloud Security',
    source: 'Cloud Posture Monitor',
    detectedAt: minutesAgo(48),
  },
  {
    id: 'ALT-1046',
    title: 'SQL injection payload blocked on orders API',
    description:
      'Repeated UNION-based injection payloads were sent to /api/v2/orders. Requests were blocked, but the endpoint is being reviewed for input validation gaps.',
    severity: 'Critical',
    status: 'Investigating',
    asset: 'api-gw-02',
    category: 'Injection',
    source: 'Web Application Firewall',
    detectedAt: minutesAgo(95),
  },
  {
    id: 'ALT-1045',
    title: 'Privilege escalation attempt on build server',
    description: 'A service account attempted to modify sudoers configuration outside of an approved change window.',
    severity: 'Critical',
    status: 'Investigating',
    asset: 'ci-runner-04',
    category: 'Endpoint',
    source: 'EDR Agent',
    detectedAt: minutesAgo(160),
  },
  {
    id: 'ALT-1044',
    title: 'Suspicious outbound traffic to unknown IP range',
    description:
      'Database server initiated 2.4 GB of outbound traffic to an IP range with no prior history. Possible data exfiltration.',
    severity: 'High',
    status: 'Open',
    asset: 'db-prod-02',
    category: 'Network',
    source: 'Network IDS',
    detectedAt: minutesAgo(210),
  },
  {
    id: 'ALT-1043',
    title: 'Multiple failed MFA challenges for privileged user',
    description:
      'User j.morgan failed 9 consecutive MFA push challenges in 4 minutes - pattern consistent with MFA fatigue attacks.',
    severity: 'High',
    status: 'Investigating',
    asset: 'Identity Provider',
    category: 'Identity',
    source: 'IAM Audit Log',
    detectedAt: minutesAgo(275),
  },
  {
    id: 'ALT-1042',
    title: 'SSH port exposed to the internet',
    description: 'Port 22 is open to 0.0.0.0/0 on a production instance after a security group change.',
    severity: 'High',
    status: 'Open',
    asset: 'web-prod-03',
    category: 'Network',
    source: 'Cloud Posture Monitor',
    detectedAt: minutesAgo(340),
  },
  {
    id: 'ALT-1041',
    title: 'Endpoint protection disabled on workstation',
    description: 'Real-time protection was turned off on LAPTOP-0231 and has not been re-enabled for 3 hours.',
    severity: 'High',
    status: 'Open',
    asset: 'LAPTOP-0231',
    category: 'Endpoint',
    source: 'EDR Agent',
    detectedAt: minutesAgo(420),
  },
  {
    id: 'ALT-1040',
    title: 'Outdated OpenSSL package on API gateway',
    description:
      "API gateway image ships an OpenSSL build that is several patch releases behind the vendor's current version.",
    severity: 'High',
    status: 'Open',
    asset: 'api-gw-01',
    category: 'Vulnerable Components',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(600),
  },
  {
    id: 'ALT-1039',
    title: 'Malware signature detected in uploaded file',
    description: 'A file uploaded through the support portal matched a known trojan signature and was quarantined.',
    severity: 'High',
    status: 'Resolved',
    asset: 'support-portal',
    category: 'Malware',
    source: 'File Scanner',
    detectedAt: minutesAgo(780),
  },
  {
    id: 'ALT-1038',
    title: 'Stored XSS payload blocked in feedback form',
    description:
      'Script tags were submitted through the feedback form. Output encoding has been added to the review page.',
    severity: 'High',
    status: 'Resolved',
    asset: 'www.acme.internal',
    category: 'Injection',
    source: 'Web Application Firewall',
    detectedAt: minutesAgo(1020),
  },
  {
    id: 'ALT-1037',
    title: 'TLS certificate expires in 5 days',
    description:
      'The certificate for staging.acme.internal expires soon. Auto-renewal failed due to a DNS validation error.',
    severity: 'Medium',
    status: 'Open',
    asset: 'staging.acme.internal',
    category: 'Transport Security',
    source: 'Certificate Monitor',
    detectedAt: minutesAgo(1180),
  },
  {
    id: 'ALT-1036',
    title: 'Sign-in from unusual location',
    description: 'User p.sharma signed in from a new country 40 minutes after a sign-in from Mumbai.',
    severity: 'Medium',
    status: 'Open',
    asset: 'Identity Provider',
    category: 'Identity',
    source: 'IAM Audit Log',
    detectedAt: minutesAgo(1300),
  },
  {
    id: 'ALT-1035',
    title: 'Unpatched CMS plugin detected',
    description: 'The marketing site runs a forms plugin two major versions behind the latest security release.',
    severity: 'Medium',
    status: 'Investigating',
    asset: 'marketing-cms',
    category: 'Vulnerable Components',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(1500),
  },
  {
    id: 'ALT-1034',
    title: 'Dangling DNS record (subdomain takeover risk)',
    description: 'promo.acme.internal points to a decommissioned cloud host that could be claimed by a third party.',
    severity: 'Medium',
    status: 'Open',
    asset: 'promo.acme.internal',
    category: 'Network',
    source: 'DNS Monitor',
    detectedAt: minutesAgo(1720),
  },
  {
    id: 'ALT-1033',
    title: 'Content-Security-Policy header missing',
    description: 'Customer dashboard responses were served without a CSP header. Policy has now been deployed.',
    severity: 'Medium',
    status: 'Resolved',
    asset: 'app.acme.internal',
    category: 'Security Headers',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(2100),
  },
  {
    id: 'ALT-1032',
    title: 'Deprecated TLS 1.0 protocol enabled',
    description: 'Legacy load balancer accepted TLS 1.0 connections. Protocol has been disabled.',
    severity: 'Medium',
    status: 'Resolved',
    asset: 'lb-legacy-01',
    category: 'Transport Security',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(2600),
  },
  {
    id: 'ALT-1031',
    title: 'Phishing email reported by employee',
    description: 'A credential-harvesting email impersonating IT support was reported. Sender domain has been blocked.',
    severity: 'Medium',
    status: 'Resolved',
    asset: 'Mail Gateway',
    category: 'Phishing',
    source: 'User Report',
    detectedAt: minutesAgo(3100),
  },
  {
    id: 'ALT-1030',
    title: 'Weak password policy on HR portal',
    description: 'Minimum password length is 6 characters with no complexity requirement.',
    severity: 'Low',
    status: 'Open',
    asset: 'hr-portal',
    category: 'Authentication',
    source: 'Policy Audit',
    detectedAt: minutesAgo(3500),
  },
  {
    id: 'ALT-1029',
    title: 'Cookies missing SameSite attribute',
    description: 'Three non-session cookies on the help centre are set without a SameSite attribute.',
    severity: 'Low',
    status: 'Open',
    asset: 'help.acme.internal',
    category: 'Session Management',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(3900),
  },
  {
    id: 'ALT-1028',
    title: 'Firewall rule changed outside change window',
    description: 'An allow rule was added to the edge firewall at 02:14 without a linked change request.',
    severity: 'Low',
    status: 'Investigating',
    asset: 'edge-fw-01',
    category: 'Network',
    source: 'Config Audit',
    detectedAt: minutesAgo(4300),
  },
  {
    id: 'ALT-1027',
    title: 'Directory listing enabled on static server',
    description: 'Auto-indexing exposed the file structure of /downloads. Indexing has been disabled.',
    severity: 'Low',
    status: 'Resolved',
    asset: 'static-01',
    category: 'Information Disclosure',
    source: 'Vulnerability Scanner',
    detectedAt: minutesAgo(5200),
  },
  {
    id: 'ALT-1026',
    title: 'API client exceeded rate limit',
    description:
      'A partner integration sent 18k requests per minute. Client has been throttled and the partner notified.',
    severity: 'Low',
    status: 'Resolved',
    asset: 'api-gw-01',
    category: 'Availability',
    source: 'API Gateway',
    detectedAt: minutesAgo(6100),
  },
  {
    id: 'ALT-1025',
    title: 'Ransomware behaviour blocked on file server',
    description: 'Mass file-rename behaviour was detected and the process was terminated. No files were encrypted.',
    severity: 'Critical',
    status: 'Resolved',
    asset: 'fs-01',
    category: 'Malware',
    source: 'EDR Agent',
    detectedAt: minutesAgo(7400),
  },
];

/** Recent activity feed shown on the Overview page. */
export const createSampleActivity = () => [
  {
    id: 'ACT-9',
    type: 'alert',
    message: 'New critical alert: Brute-force login attempts on admin portal',
    time: minutesAgo(12),
  },
  {
    id: 'ACT-8',
    type: 'scan',
    message: 'Scheduled scan completed for app.acme.internal (score 88)',
    time: minutesAgo(35),
  },
  { id: 'ACT-7', type: 'policy', message: 'MFA enforcement policy updated for Finance group', time: minutesAgo(90) },
  {
    id: 'ACT-6',
    type: 'resolved',
    message: 'Resolved: Malware signature detected in uploaded file',
    time: minutesAgo(180),
  },
  { id: 'ACT-5', type: 'login', message: 'Admin sign-in from new device (Windows, Chrome)', time: minutesAgo(260) },
  { id: 'ACT-4', type: 'report', message: 'Weekly security report generated and shared', time: minutesAgo(560) },
  {
    id: 'ACT-3',
    type: 'resolved',
    message: 'Resolved: Stored XSS payload blocked in feedback form',
    time: minutesAgo(900),
  },
  { id: 'ACT-2', type: 'policy', message: 'Firewall baseline applied to 12 production hosts', time: minutesAgo(1400) },
];

/** Notifications for the top-bar dropdown. */
export const createSampleNotifications = () => [
  {
    id: 'NTF-5',
    type: 'critical',
    title: 'Critical alert raised',
    message: 'Brute-force login attempts on admin portal.',
    time: minutesAgo(12),
    read: false,
    link: '/alerts?search=ALT-1048',
  },
  {
    id: 'NTF-4',
    type: 'critical',
    title: 'Public storage bucket',
    message: 'acme-finance-exports allows anonymous read access.',
    time: minutesAgo(48),
    read: false,
    link: '/alerts?search=ALT-1047',
  },
  {
    id: 'NTF-3',
    type: 'success',
    title: 'Scan completed',
    message: 'app.acme.internal scored 88/100.',
    time: minutesAgo(35),
    read: false,
    link: '/scanner',
  },
  {
    id: 'NTF-2',
    type: 'info',
    title: 'Weekly report ready',
    message: 'Your weekly security summary is available.',
    time: minutesAgo(560),
    read: true,
    link: '/reports',
  },
  {
    id: 'NTF-1',
    type: 'warning',
    title: 'Certificate expiring',
    message: 'staging.acme.internal expires in 5 days.',
    time: minutesAgo(1180),
    read: true,
    link: '/alerts?search=ALT-1037',
  },
];

/** A few past scans so Scan History is not empty on first visit. */
export const createSampleScans = () =>
  [
    ['https://app.acme.internal', 35],
    ['https://shop.acme.internal', 1440],
    ['https://api.acme.internal', 2900],
    ['https://blog.acme.internal', 5800],
  ].map(([url, minutes]) => generateScanReport(url, new Date(Date.now() - minutes * 60 * 1000)));

/** Weekly detected vs resolved vulnerabilities (Mon - Sun). */
export const WEEKLY_ACTIVITY = [
  { day: 'Mon', detected: 18, resolved: 12 },
  { day: 'Tue', detected: 24, resolved: 17 },
  { day: 'Wed', detected: 21, resolved: 19 },
  { day: 'Thu', detected: 30, resolved: 22 },
  { day: 'Fri', detected: 26, resolved: 24 },
  { day: 'Sat', detected: 14, resolved: 15 },
  { day: 'Sun', detected: 11, resolved: 13 },
];

/** Previous week, used by the range toggle on Reports & Analytics. */
export const PREVIOUS_WEEK_ACTIVITY = [
  { day: 'Mon', detected: 22, resolved: 14 },
  { day: 'Tue', detected: 19, resolved: 16 },
  { day: 'Wed', detected: 27, resolved: 18 },
  { day: 'Thu', detected: 25, resolved: 21 },
  { day: 'Fri', detected: 31, resolved: 20 },
  { day: 'Sat', detected: 12, resolved: 14 },
  { day: 'Sun', detected: 9, resolved: 11 },
];

/** Security performance score per domain (0 - 100). */
export const SECURITY_PERFORMANCE = [
  { area: 'Network', score: 88 },
  { area: 'Web Apps', score: 76 },
  { area: 'Cloud', score: 81 },
  { area: 'Endpoints', score: 92 },
  { area: 'Identity', score: 84 },
  { area: 'Data', score: 79 },
];

/** Default user settings. */
export const DEFAULT_SETTINGS = {
  profile: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@acme.internal',
    jobTitle: 'Security Analyst',
    company: 'Acme Corporation',
    phone: '',
  },
  notifications: {
    inApp: true,
    email: true,
    criticalOnly: false,
    scanComplete: true,
    weeklyReport: true,
  },
  theme: {
    mode: 'dark',
    accent: 'blue',
    animations: true,
  },
};
