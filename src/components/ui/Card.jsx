/**
 * Glass-style card used for every panel in the dashboard.
 * Pass `title` (and optional `subtitle` / `action`) to render a header row.
 */
export default function Card({ title, subtitle, action, icon: Icon, className = '', bodyClassName = '', children }) {
  return (
    <section className={`glass-card animate-fade-up ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-4.5 w-4.5" />
              </span>
            )}
            <div>
              {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={`p-5 sm:p-6 ${title || action ? 'pt-4 sm:pt-4' : ''} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
