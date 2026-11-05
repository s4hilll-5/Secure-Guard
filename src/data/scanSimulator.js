/**
 * SIMULATED vulnerability scanner.
 * ------------------------------------------------------------------
 * IMPORTANT: Nothing in this file contacts the target website.
 * Results are generated locally from a fixed catalogue of common web
 * security findings, using a pseudo-random generator seeded by the URL.
 * The same URL therefore always produces the same sample report, which
 * makes the demo predictable during a presentation.
 */
import { SEVERITY_CONFIG } from './constants';
import { createId } from '../utils/time';

/** Steps displayed while the fake scan is "running". */
export const SCAN_STAGES = [
  'Resolving host and preparing sandbox',
  'Checking TLS / SSL configuration',
  'Analysing HTTP security headers',
  'Inspecting cookies and session handling',
  'Probing common misconfigurations',
  'Compiling sample report',
];

/** Total simulated scan duration in ms. */
export const SCAN_DURATION = 4800;

/** Catalogue of sample findings the simulator can pick from. */
const FINDINGS_CATALOGUE = [
  {
    title: 'Reflected Cross-Site Scripting (XSS) in search parameter',
    severity: 'Critical',
    category: 'Injection',
    location: '/search?q=',
    reference: 'OWASP A03:2021 - Injection',
    description:
      'User-supplied input from the "q" parameter is echoed back into the page without output encoding, allowing script execution in the victim\'s browser.',
    recommendation:
      'Encode all user-controlled output based on context (HTML, attribute, JS). Add a strict Content-Security-Policy as a second line of defence.',
  },
  {
    title: 'SQL injection pattern accepted by login form',
    severity: 'Critical',
    category: 'Injection',
    location: '/auth/login',
    reference: 'OWASP A03:2021 - Injection',
    description:
      'The login endpoint responded differently to crafted input, suggesting that SQL queries are built through string concatenation.',
    recommendation:
      'Use parameterised queries / prepared statements everywhere and validate input server-side. Review the ORM for raw query usage.',
  },
  {
    title: 'Source control directory (.git) publicly accessible',
    severity: 'Critical',
    category: 'Information Disclosure',
    location: '/.git/HEAD',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description:
      'Repository metadata can be downloaded, which may expose source code, commit history and hard-coded secrets.',
    recommendation:
      'Block access to hidden directories at the web server level and remove the .git folder from deployment artifacts. Rotate any exposed secrets.',
  },
  {
    title: 'HTTP Strict-Transport-Security (HSTS) header missing',
    severity: 'High',
    category: 'Transport Security',
    location: 'Response headers',
    reference: 'OWASP A02:2021 - Cryptographic Failures',
    description:
      'Without HSTS, browsers may connect over plain HTTP first, leaving users exposed to SSL-stripping attacks on hostile networks.',
    recommendation:
      'Send "Strict-Transport-Security: max-age=31536000; includeSubDomains" on all HTTPS responses and consider HSTS preloading.',
  },
  {
    title: 'Outdated JavaScript library with known vulnerabilities',
    severity: 'High',
    category: 'Vulnerable Components',
    location: '/assets/js/vendor.js',
    reference: 'OWASP A06:2021 - Vulnerable and Outdated Components',
    description:
      'A front-end library version associated with publicly documented security issues appears to be bundled with the site.',
    recommendation:
      'Upgrade third-party libraries to their latest supported versions and add automated dependency scanning to the CI pipeline.',
  },
  {
    title: 'Weak TLS cipher suites supported',
    severity: 'High',
    category: 'Transport Security',
    location: 'TLS handshake',
    reference: 'OWASP A02:2021 - Cryptographic Failures',
    description:
      'The server negotiates legacy cipher suites (e.g. CBC-mode with SHA-1) that are considered weak by current standards.',
    recommendation:
      'Restrict the server to TLS 1.2+ with modern AEAD cipher suites (AES-GCM, ChaCha20-Poly1305). Disable TLS 1.0/1.1.',
  },
  {
    title: 'Permissive CORS policy reflects any origin',
    severity: 'High',
    category: 'Access Control',
    location: '/api/*',
    reference: 'OWASP A01:2021 - Broken Access Control',
    description:
      'The API reflects the request Origin in Access-Control-Allow-Origin together with credentials, letting any site read authenticated responses.',
    recommendation:
      'Use an explicit allow-list of trusted origins and never combine wildcard or reflected origins with Access-Control-Allow-Credentials.',
  },
  {
    title: 'Administrative panel reachable from the internet',
    severity: 'High',
    category: 'Access Control',
    location: '/admin',
    reference: 'OWASP A01:2021 - Broken Access Control',
    description:
      'The admin login page is publicly reachable, increasing exposure to credential stuffing and brute-force attacks.',
    recommendation:
      'Restrict the admin area by IP allow-list or VPN, enforce MFA and add account lockout / rate limiting.',
  },
  {
    title: 'Content-Security-Policy header not configured',
    severity: 'Medium',
    category: 'Security Headers',
    location: 'Response headers',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description:
      'No CSP was returned, so the browser has no policy restricting which scripts, styles or frames can load.',
    recommendation:
      'Introduce a CSP in report-only mode, review violations, then enforce a policy such as "default-src \'self\'".',
  },
  {
    title: 'Session cookie missing Secure and HttpOnly flags',
    severity: 'Medium',
    category: 'Session Management',
    location: 'Set-Cookie: session_id',
    reference: 'OWASP A07:2021 - Identification and Authentication Failures',
    description: 'The session cookie can be read by JavaScript and may be sent over unencrypted connections.',
    recommendation: 'Set the Secure, HttpOnly and SameSite=Lax (or Strict) attributes on all authentication cookies.',
  },
  {
    title: 'Clickjacking protection (X-Frame-Options) missing',
    severity: 'Medium',
    category: 'Security Headers',
    location: 'Response headers',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description:
      'Pages can be embedded in third-party iframes, enabling UI-redress attacks that trick users into clicking hidden elements.',
    recommendation: 'Send "X-Frame-Options: DENY" or a CSP "frame-ancestors \'none\'" directive.',
  },
  {
    title: 'No rate limiting on authentication endpoint',
    severity: 'Medium',
    category: 'Authentication',
    location: '/auth/login',
    reference: 'OWASP A07:2021 - Identification and Authentication Failures',
    description: 'Repeated login attempts were not throttled, which makes password-guessing attacks practical.',
    recommendation: 'Add per-IP and per-account rate limits, progressive delays and CAPTCHA after several failures.',
  },
  {
    title: 'Open redirect in "next" parameter',
    severity: 'Medium',
    category: 'Input Validation',
    location: '/logout?next=',
    reference: 'OWASP A01:2021 - Broken Access Control',
    description:
      'The application redirects to arbitrary external URLs supplied in the "next" parameter, which can be abused in phishing campaigns.',
    recommendation: 'Only allow relative paths or an allow-list of destinations for redirect parameters.',
  },
  {
    title: 'Server version disclosed in response headers',
    severity: 'Low',
    category: 'Information Disclosure',
    location: 'Server / X-Powered-By headers',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description: 'Headers reveal the web server and framework versions, helping attackers fingerprint the stack.',
    recommendation:
      'Remove or genericise the Server and X-Powered-By headers in the web server or framework configuration.',
  },
  {
    title: 'X-Content-Type-Options header missing',
    severity: 'Low',
    category: 'Security Headers',
    location: 'Response headers',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description: 'Browsers may MIME-sniff responses and interpret files as a different content type than intended.',
    recommendation: 'Send "X-Content-Type-Options: nosniff" with every response.',
  },
  {
    title: 'Directory listing enabled',
    severity: 'Low',
    category: 'Information Disclosure',
    location: '/uploads/',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description:
      'The web server lists directory contents when no index file is present, exposing file names and structure.',
    recommendation: 'Disable auto-indexing (e.g. "Options -Indexes" in Apache, "autoindex off" in Nginx).',
  },
  {
    title: 'Referrer-Policy not set',
    severity: 'Low',
    category: 'Security Headers',
    location: 'Response headers',
    reference: 'OWASP A05:2021 - Security Misconfiguration',
    description: 'Full URLs, including query strings, may leak to third-party sites through the Referer header.',
    recommendation: 'Send "Referrer-Policy: strict-origin-when-cross-origin" or stricter.',
  },
  {
    title: 'Mixed content loaded over HTTP',
    severity: 'Low',
    category: 'Transport Security',
    location: '/blog',
    reference: 'OWASP A02:2021 - Cryptographic Failures',
    description: 'Some images are requested over HTTP on an HTTPS page, weakening transport security.',
    recommendation: 'Serve all sub-resources over HTTPS and add "upgrade-insecure-requests" to the CSP.',
  },
];

/** Deterministic string hash -> 32-bit integer. */
function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small seeded PRNG (mulberry32) returning numbers in [0, 1). */
function createRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Penalty points subtracted from 100 for each finding. */
const SCORE_PENALTY = { Critical: 9, High: 5, Medium: 2.5, Low: 1 };

/** Count findings per severity -> { Critical: n, High: n, Medium: n, Low: n } */
export function countBySeverity(findings) {
  return findings.reduce((counts, finding) => ({ ...counts, [finding.severity]: counts[finding.severity] + 1 }), {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  });
}

/**
 * Build a simulated scan report for a (validated) URL.
 * @param {string} url - normalised URL, e.g. "https://example.com"
 * @param {Date} [scannedAt]
 */
export function generateScanReport(url, scannedAt = new Date()) {
  const host = new URL(url).hostname;
  const random = createRandom(hashString(host));

  // Shuffle the catalogue with the seeded PRNG (Fisher-Yates)
  const pool = [...FINDINGS_CATALOGUE];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick 5-10 findings, ordered by severity
  const findingCount = 5 + Math.floor(random() * 6);
  const findings = pool
    .slice(0, findingCount)
    .sort((a, b) => SEVERITY_CONFIG[b.severity].weight - SEVERITY_CONFIG[a.severity].weight)
    .map((finding, index) => ({ ...finding, id: `F-${String(index + 1).padStart(2, '0')}` }));

  const penalty = findings.reduce((sum, finding) => sum + SCORE_PENALTY[finding.severity], 0);
  const score = Math.max(35, Math.min(97, Math.round(100 - penalty)));

  return {
    id: createId('SCN'),
    url,
    host,
    scannedAt: scannedAt.toISOString(),
    durationSeconds: Number((SCAN_DURATION / 1000 + random() * 1.5).toFixed(1)),
    pagesCrawled: 18 + Math.floor(random() * 120),
    score,
    counts: countBySeverity(findings),
    findings,
    simulated: true,
  };
}
