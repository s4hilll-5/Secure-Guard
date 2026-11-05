import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronDown, Moon, Settings, Sun, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import useClickOutside from '../../hooks/useClickOutside';
import Avatar from '../ui/Avatar';

/** Avatar button in the top bar with a small account menu. */
export default function ProfileMenu() {
  const { settings, updateSettings } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const { profile, theme } = settings;
  const isDark = theme.mode === 'dark';

  // Quick theme switch (same setting as Settings -> Theme preferences)
  const toggleTheme = () => {
    updateSettings({ ...settings, theme: { ...theme, mode: isDark ? 'light' : 'dark' } });
    toast.info(`Switched to ${isDark ? 'light' : 'dark'} theme`);
    setOpen(false);
  };

  const menuItemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-xl border border-transparent p-1 pr-2 transition hover:border-line hover:bg-elevated"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        <Avatar name={profile.fullName} size="sm" online />
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-ink">{profile.fullName}</span>
          <span className="block max-w-36 truncate text-[11px] text-subtle">{profile.jobTitle || 'Team member'}</span>
        </span>
        <ChevronDown className={`hidden h-4 w-4 text-subtle transition md:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="animate-fade-up absolute top-12 right-0 z-50 w-64 rounded-2xl border border-line-strong bg-surface-solid p-2 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-3 border-b border-line px-3 pt-2 pb-3">
            <Avatar name={profile.fullName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{profile.fullName}</p>
              <p className="truncate text-xs text-subtle">{profile.email}</p>
            </div>
          </div>
          <div className="pt-2">
            <Link to="/settings" onClick={close} className={menuItemClass}>
              <UserRound className="h-4 w-4" /> My profile
            </Link>
            <Link to="/reports" onClick={close} className={menuItemClass}>
              <BarChart3 className="h-4 w-4" /> Reports
            </Link>
            <Link to="/settings" onClick={close} className={menuItemClass}>
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button type="button" onClick={toggleTheme} className={menuItemClass}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Light theme' : 'Dark theme'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
