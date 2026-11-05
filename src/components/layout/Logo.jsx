import { ShieldCheck } from 'lucide-react';

/** SecureGuard brand mark. `compact` hides the wordmark (collapsed sidebar). */
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/30">
        <ShieldCheck className="h-5.5 w-5.5 text-white" strokeWidth={2.25} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[17px] font-extrabold tracking-tight text-ink">
            Secure<span className="text-gradient">Guard</span>
          </p>
          <p className="text-[11px] font-medium text-subtle">Security Operations</p>
        </div>
      )}
    </div>
  );
}
