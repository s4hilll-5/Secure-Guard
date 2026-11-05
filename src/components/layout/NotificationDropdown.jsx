import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Bell, BellOff, CheckCheck, CheckCircle2, Info, Trash2, TriangleAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import useClickOutside from '../../hooks/useClickOutside';
import { formatRelativeTime } from '../../utils/time';
import EmptyState from '../ui/EmptyState';

const TYPE_STYLES = {
  critical: { icon: AlertOctagon, color: 'text-critical bg-critical/12' },
  warning: { icon: TriangleAlert, color: 'text-medium bg-medium/12' },
  success: { icon: CheckCircle2, color: 'text-success bg-success/12' },
  info: { icon: Info, color: 'text-primary bg-primary-soft' },
};

/**
 * Bell icon with unread badge + dropdown panel.
 * Clicking a notification marks it as read and navigates to its link.
 */
export default function NotificationDropdown() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const handleSelect = (notification) => {
    markNotificationRead(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
          open ? 'border-line-strong bg-elevated-hover text-ink' : 'border-line bg-elevated text-muted hover:text-ink'
        }`}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-canvas bg-critical px-1 text-[10px] font-bold text-white tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-up fixed inset-x-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-line-strong bg-surface-solid shadow-2xl shadow-black/40 sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-subtle">{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllNotificationsRead}
                disabled={!unreadCount}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
              <button
                type="button"
                onClick={clearNotifications}
                disabled={!notifications.length}
                className="rounded-lg p-1.5 text-subtle transition hover:bg-elevated hover:text-critical disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Clear all notifications"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              compact
              icon={BellOff}
              title="No notifications"
              description="New alerts and scan results will appear here."
            />
          ) : (
            <ul className="max-h-[400px] divide-y divide-line overflow-y-auto">
              {notifications.map((notification) => {
                const style = TYPE_STYLES[notification.type] ?? TYPE_STYLES.info;
                const Icon = style.icon;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(notification)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-elevated ${
                        notification.read ? '' : 'bg-primary/[0.04]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm ${notification.read ? 'font-medium text-muted' : 'font-semibold text-ink'}`}
                          >
                            {notification.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-subtle">
                            {formatRelativeTime(notification.time)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{notification.message}</span>
                      </span>
                      {!notification.read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
