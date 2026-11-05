import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, ShieldCheck, X } from 'lucide-react';
import { NAV_ITEMS } from '../../data/navigation';
import { useApp } from '../../context/AppContext';
import Logo from './Logo';
import Avatar from '../ui/Avatar';

/**
 * Responsive sidebar.
 * - Desktop (lg+): always visible, can be collapsed to an icon rail.
 * - Mobile / tablet: slides in as a drawer over a dimmed backdrop.
 */
export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { settings, openAlertCount } = useApp();
  const { profile } = settings;
  const badges = { openAlerts: openAlertCount };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface-solid/95 backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:bg-surface ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-72'}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div
          className={`flex h-[72px] items-center border-b border-line justify-between px-5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
        >
          <div className={collapsed ? 'lg:hidden' : ''}>
            <Logo />
          </div>
          {collapsed && (
            <div className="hidden lg:block">
              <Logo compact />
            </div>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-muted transition hover:bg-elevated hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p
            className={`px-3 pb-2 text-[11px] font-semibold tracking-wider text-subtle uppercase ${collapsed ? 'lg:hidden' : ''}`}
          >
            Main menu
          </p>
          {NAV_ITEMS.map(({ path, label, icon: Icon, badgeKey }) => {
            const badge = badgeKey ? badges[badgeKey] : 0;
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                    collapsed ? 'lg:justify-center' : ''
                  } ${isActive ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-elevated hover:text-ink'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-primary" />}
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
                    {badge > 0 && (
                      <span
                        className={`ml-auto rounded-full bg-critical/15 px-2 py-0.5 text-[11px] font-semibold text-critical tabular-nums ${
                          collapsed ? 'lg:absolute lg:top-1 lg:right-1 lg:ml-0 lg:px-1.5' : ''
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Protection status */}
        <div className={collapsed ? 'lg:hidden' : ''}>
          <div className="mx-4 mb-4 rounded-xl border border-line bg-linear-to-br from-primary/10 to-accent/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-success" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              Protection active
            </div>
            <p className="mt-1 text-xs text-muted">Monitoring 148 assets across 4 environments.</p>
          </div>
        </div>

        {/* User profile */}
        <div className="border-t border-line p-3">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-elevated ${collapsed ? 'lg:justify-center' : ''}`}
            title={collapsed ? profile.fullName : undefined}
          >
            <Avatar name={profile.fullName} online />
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-ink">{profile.fullName}</p>
              <p className="truncate text-xs text-subtle">{profile.jobTitle || 'Team member'}</p>
            </div>
            <ShieldCheck className={`h-4 w-4 text-success ${collapsed ? 'lg:hidden' : ''}`} />
          </NavLink>

          {/* Collapse toggle (desktop only) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-subtle transition hover:bg-elevated hover:text-ink lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>
    </>
  );
}
