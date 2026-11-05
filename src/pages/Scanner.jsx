import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cookie, Globe, Info, Lock, Radar, ScanSearch, ServerCog, ShieldQuestion } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SCAN_DURATION, SCAN_STAGES, generateScanReport } from '../data/scanSimulator';
import { validateWebsiteUrl } from '../utils/validation';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SimulatedBadge } from '../components/ui/Badges';
import ScanProgress from '../components/scanner/ScanProgress';
import ScanResults from '../components/scanner/ScanResults';
import ScanHistory from '../components/scanner/ScanHistory';

const EXAMPLE_TARGETS = ['example.com', 'shop.example.org', 'demo-bank.test'];

/** What the simulated scanner pretends to check - shown before the first scan. */
const CHECKS = [
  { icon: Lock, title: 'TLS & transport', text: 'Certificate, protocol versions, HSTS' },
  { icon: ServerCog, title: 'Security headers', text: 'CSP, X-Frame-Options, Referrer-Policy' },
  { icon: Cookie, title: 'Cookies & sessions', text: 'Secure, HttpOnly and SameSite flags' },
  { icon: ShieldQuestion, title: 'Common weaknesses', text: 'Injection, exposure, misconfiguration' },
];

export default function Scanner() {
  const { scanHistory, addScan, deleteScan, clearScanHistory } = useApp();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'complete'
  const [progress, setProgress] = useState(0);
  const [activeReport, setActiveReport] = useState(null);

  const targetUrlRef = useRef('');
  const addScanRef = useRef(addScan);
  const resultsRef = useRef(null);

  // Keep a ref to the latest addScan so the running timer never calls a stale version.
  useEffect(() => {
    addScanRef.current = addScan;
  }, [addScan]);

  // Open a report from history when the URL contains ?scan=<id>
  const requestedScanId = searchParams.get('scan');
  useEffect(() => {
    if (!requestedScanId) return;
    const match = scanHistory.find((scan) => scan.id === requestedScanId);
    if (match) {
      setActiveReport(match);
      setStatus('complete');
    }
  }, [requestedScanId, scanHistory]);

  // Drive the simulated scan: update progress every 100ms until SCAN_DURATION has elapsed.
  useEffect(() => {
    if (status !== 'scanning') return undefined;
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const percent = Math.min(100, ((Date.now() - startedAt) / SCAN_DURATION) * 100);
      setProgress(percent);

      if (percent >= 100) {
        window.clearInterval(timer);
        const report = generateScanReport(targetUrlRef.current);
        addScanRef.current(report);
        setActiveReport(report);
        setStatus('complete');
        toast.success(`Simulated scan of ${report.host} completed`);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [status, toast]);

  // Scroll the results into view once a scan finishes.
  useEffect(() => {
    if (status === 'complete' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status, activeReport?.id]);

  const startScan = (rawUrl = urlInput) => {
    const { url, error: validationError } = validateWebsiteUrl(rawUrl);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setUrlInput(url);
    targetUrlRef.current = url;
    setSearchParams({}, { replace: true });
    setActiveReport(null);
    setProgress(0);
    setStatus('scanning');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    startScan();
  };

  const cancelScan = () => {
    setStatus('idle');
    setProgress(0);
    toast.info('Scan cancelled');
  };

  const viewScan = (scan) => {
    setSearchParams({ scan: scan.id });
    setActiveReport(scan);
    setStatus('complete');
  };

  const removeScan = (scan) => {
    deleteScan(scan.id);
    if (activeReport?.id === scan.id) {
      setActiveReport(null);
      setStatus('idle');
      setSearchParams({}, { replace: true });
    }
    toast.success(`Removed scan of ${scan.host}`);
  };

  const clearHistory = () => {
    clearScanHistory();
    setActiveReport(null);
    setStatus('idle');
    setSearchParams({}, { replace: true });
    toast.success('Scan history cleared');
  };

  const isScanning = status === 'scanning';
  const stageIndex = Math.min(SCAN_STAGES.length - 1, Math.floor((progress / 100) * SCAN_STAGES.length));

  return (
    <>
      <PageHeader
        title="Vulnerability Scanner"
        description="Enter a website address to run a simulated security assessment and review sample findings with remediation guidance."
        actions={<SimulatedBadge />}
      />

      {/* Disclaimer - this page never performs a real scan */}
      <div className="animate-fade-up mb-5 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-3.5 text-sm">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
        <p className="text-muted">
          <span className="font-semibold text-ink">Demonstration mode.</span> No requests are sent to the website you
          enter. Results are generated locally from a catalogue of common issues and do not reflect the real security of
          any site.
        </p>
      </div>

      {/* Scan form */}
      <Card className="mb-5" bodyClassName="sm:p-7">
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="scan-url" className="mb-2 block text-sm font-semibold text-ink">
            Website URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-subtle" />
              <input
                id="scan-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={urlInput}
                disabled={isScanning}
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  if (error) setError('');
                }}
                placeholder="https://example.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'scan-url-error' : 'scan-url-hint'}
                className={`input-base h-12 pl-11 text-[15px] ${error ? 'border-critical focus:border-critical focus:ring-critical/15' : ''}`}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              icon={isScanning ? undefined : ScanSearch}
              loading={isScanning}
              className="sm:w-48"
            >
              {isScanning ? 'Scanning...' : 'Scan Website'}
            </Button>
          </div>
          {error ? (
            <p id="scan-url-error" role="alert" className="mt-2 text-xs font-medium text-critical">
              {error}
            </p>
          ) : (
            <p id="scan-url-hint" className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle">
              Try an example:
              {EXAMPLE_TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={isScanning}
                  onClick={() => {
                    setUrlInput(target);
                    startScan(target);
                  }}
                  className="rounded-md border border-line bg-elevated px-2 py-0.5 font-mono text-[11px] text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {target}
                </button>
              ))}
            </p>
          )}
        </form>
      </Card>

      {/* Progress / results / intro */}
      <div ref={resultsRef} className="mb-5 scroll-mt-24">
        {isScanning && (
          <ScanProgress host={targetUrlRef.current} progress={progress} stageIndex={stageIndex} onCancel={cancelScan} />
        )}

        {status === 'complete' && activeReport && (
          <ScanResults key={activeReport.id} report={activeReport} onRescan={() => startScan(activeReport.url)} />
        )}

        {status === 'idle' && (
          <Card>
            <div className="flex flex-col items-center gap-6 py-4 text-center lg:flex-row lg:text-left">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Radar className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-ink">Ready to scan</h3>
                <p className="mt-1 text-sm text-muted">
                  Enter a URL above or pick a previous report from the history below. Each simulated report covers these
                  areas:
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {CHECKS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-line bg-elevated p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs text-muted">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <ScanHistory
        scans={scanHistory}
        activeId={status === 'complete' ? activeReport?.id : null}
        onView={viewScan}
        onDelete={removeScan}
        onClear={clearHistory}
      />
    </>
  );
}
