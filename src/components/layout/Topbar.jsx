import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarDays, Menu, Search, X } from 'lucide-react';
import { NAV_ITEMS } from '../../data/navigation';
import { formatLongDate, formatShortDate } from '../../utils/time';
import GlobalSearch from './GlobalSearch';
import NotificationDropdown from './NotificationDropdown';
import ProfileMenu from './ProfileMenu';

/** Sticky top navigation: menu button (mobile), search, date, notifications, profile. */
export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [today, setToday] = useState(() => new Date());

  // Keep the date correct if the dashboard stays open past midnight.
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentPage =
    NAV_ITEMS.find((item) => (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)))
      ?.label ?? 'SecureGuard';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/75 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elevated text-muted transition hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 md:hidden">
          <p className="truncate text-sm font-semibold text-ink">{currentPage}</p>
          <p className="truncate text-[11px] text-subtle">{formatShortDate(today)}</p>
        </div>

        <div className="hidden max-w-md flex-1 md:block">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-elevated px-3 py-2 text-xs font-medium text-muted md:flex">
            <CalendarDays className="h-4 w-4 text-primary" />
            <time dateTime={today.toISOString().slice(0, 10)}>
              <span className="xl:hidden">{formatShortDate(today)}</span>
              <span className="hidden xl:inline">{formatLongDate(today)}</span>
            </time>
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elevated text-muted transition hover:text-ink md:hidden"
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
          >
            {mobileSearchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </button>

          <NotificationDropdown />
          <div className="h-8 w-px bg-line" />
          <ProfileMenu />
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="animate-fade-up border-t border-line px-4 py-3 md:hidden">
          <GlobalSearch autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
