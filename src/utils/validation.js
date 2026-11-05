/**
 * Form validation helpers. Each returns an error message string, or '' when valid.
 */

const DOMAIN_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const IPV4_PATTERN = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

/**
 * Validate and normalise a website address typed by the user.
 * Accepts "example.com", "https://example.com/path", "localhost", IPv4 addresses.
 * @returns {{ url?: string, error?: string }}
 */
export function validateWebsiteUrl(rawValue) {
  const value = rawValue.trim();
  if (!value) return { error: 'Please enter a website URL to scan.' };
  if (/\s/.test(value)) return { error: 'URLs cannot contain spaces.' };

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;

  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { error: 'That does not look like a valid URL.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { error: 'Only http:// and https:// websites can be scanned.' };
  }

  const host = parsed.hostname;
  const isValidHost = host === 'localhost' || DOMAIN_PATTERN.test(host) || IPV4_PATTERN.test(host);
  if (!isValidHost) return { error: 'Enter a valid domain, for example "example.com".' };

  const path = parsed.pathname === '/' ? '' : parsed.pathname;
  return { url: `${parsed.protocol}//${parsed.host}${path}` };
}

export function validateRequired(value, label, minLength = 1) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < minLength) return `${label} must be at least ${minLength} characters.`;
  return '';
}

export function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.';
  return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email address.';
}

/** Phone is optional - only validated when something is typed. */
export function validatePhone(value) {
  if (!value.trim()) return '';
  return PHONE_PATTERN.test(value.trim()) ? '' : 'Enter a valid phone number (digits, spaces, +, -, brackets).';
}
