/**
 * Trigger a browser download for in-memory content (no server needed).
 * @param {string} content  - file contents
 * @param {string} filename - e.g. "report.csv"
 * @param {string} mimeType - e.g. "text/csv"
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking the URL
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Local date as "YYYY-MM-DD" - used in downloaded file names. */
export function fileDateStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
