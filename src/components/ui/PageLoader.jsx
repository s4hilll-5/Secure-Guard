import { ShieldCheck } from 'lucide-react';

/** Full-page loading indicator shown while a route's code is downloading. */
export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="animate-ping-slow absolute h-full w-full rounded-2xl bg-primary/30" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-white">
          <ShieldCheck className="h-7 w-7" />
        </span>
      </div>
      <p className="text-sm text-muted">Loading secure workspace...</p>
    </div>
  );
}
