/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/constants';
import {
  DEFAULT_SETTINGS,
  createSampleActivity,
  createSampleAlerts,
  createSampleNotifications,
  createSampleScans,
} from '../data/sampleData';
import { createId } from '../utils/time';

/**
 * Global application state.
 * ------------------------------------------------------------------
 * Alerts, notifications, the activity feed, scan history and user
 * settings are shared between several pages (e.g. resolving an alert
 * updates the Overview stats, the sidebar badge and the reports), so
 * they live in one context. Every slice is persisted to LocalStorage.
 */
const AppContext = createContext(null);

const MAX_ACTIVITY = 30;
const MAX_NOTIFICATIONS = 30;
const MAX_SCANS = 20;

/** Merge stored settings with defaults so newly added keys always exist. */
const withDefaults = (stored) => ({
  profile: { ...DEFAULT_SETTINGS.profile, ...stored?.profile },
  notifications: { ...DEFAULT_SETTINGS.notifications, ...stored?.notifications },
  theme: { ...DEFAULT_SETTINGS.theme, ...stored?.theme },
});

export function AppProvider({ children }) {
  const [alerts, setAlerts] = useLocalStorage(STORAGE_KEYS.alerts, createSampleAlerts);
  const [notifications, setNotifications] = useLocalStorage(STORAGE_KEYS.notifications, createSampleNotifications);
  const [activity, setActivity] = useLocalStorage(STORAGE_KEYS.activity, createSampleActivity);
  const [scanHistory, setScanHistory] = useLocalStorage(STORAGE_KEYS.scans, createSampleScans);
  const [storedSettings, setStoredSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);

  const settings = useMemo(() => withDefaults(storedSettings), [storedSettings]);

  // Apply theme preferences to <html> so the CSS variables switch instantly.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme.mode;
    root.dataset.accent = settings.theme.accent;
    root.dataset.motion = settings.theme.animations ? 'full' : 'reduced';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', settings.theme.mode === 'light' ? '#eef2f8' : '#0B1120');
  }, [settings.theme]);

  /* ---------------- Activity & notifications ---------------- */

  const logActivity = useCallback(
    (type, message) => {
      setActivity((prev) =>
        [{ id: createId('ACT'), type, message, time: new Date().toISOString() }, ...prev].slice(0, MAX_ACTIVITY),
      );
    },
    [setActivity],
  );

  /**
   * Push an in-app notification, respecting the user's notification preferences:
   * - "In-app notifications" off -> nothing is added
   * - "Critical alerts only" on -> only notifications of type "critical" are added
   */
  const addNotification = useCallback(
    ({ type = 'info', title, message, link }) => {
      const prefs = settings.notifications;
      if (!prefs.inApp) return;
      if (prefs.criticalOnly && type !== 'critical') return;

      setNotifications((prev) =>
        [
          { id: createId('NTF'), type, title, message, link, time: new Date().toISOString(), read: false },
          ...prev,
        ].slice(0, MAX_NOTIFICATIONS),
      );
    },
    [settings.notifications, setNotifications],
  );

  const markNotificationRead = useCallback(
    (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [setNotifications],
  );

  const markAllNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [setNotifications],
  );

  const clearNotifications = useCallback(() => setNotifications([]), [setNotifications]);

  /* ---------------- Alerts ---------------- */

  const setAlertStatus = useCallback(
    (id, status) => {
      const target = alerts.find((alert) => alert.id === id);
      if (!target || target.status === status) return;

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? { ...alert, status, resolvedAt: status === 'Resolved' ? new Date().toISOString() : undefined }
            : alert,
        ),
      );
      logActivity(
        status === 'Resolved' ? 'resolved' : 'alert',
        `${status === 'Resolved' ? 'Resolved' : `Marked as ${status.toLowerCase()}`}: ${target.title}`,
      );
    },
    [alerts, setAlerts, logActivity],
  );

  const resolveAlert = useCallback((id) => setAlertStatus(id, 'Resolved'), [setAlertStatus]);

  const deleteAlert = useCallback(
    (id) => {
      const target = alerts.find((alert) => alert.id === id);
      if (!target) return;
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      logActivity('deleted', `Deleted alert ${target.id}: ${target.title}`);
    },
    [alerts, setAlerts, logActivity],
  );

  const restoreSampleAlerts = useCallback(() => {
    setAlerts(createSampleAlerts());
    logActivity('policy', 'Sample alerts restored');
  }, [setAlerts, logActivity]);

  /* ---------------- Scans ---------------- */

  const addScan = useCallback(
    (report) => {
      setScanHistory((prev) => [report, ...prev].slice(0, MAX_SCANS));
      logActivity('scan', `Simulated scan completed for ${report.host} (score ${report.score})`);

      if (settings.notifications.scanComplete) {
        const hasCritical = report.counts.Critical > 0;
        addNotification({
          type: hasCritical ? 'critical' : 'success',
          title: hasCritical ? 'Scan found critical issues' : 'Scan completed',
          message: `${report.host} scored ${report.score}/100 (simulated).`,
          link: '/scanner',
        });
      }
    },
    [setScanHistory, logActivity, addNotification, settings.notifications.scanComplete],
  );

  const deleteScan = useCallback(
    (id) => setScanHistory((prev) => prev.filter((scan) => scan.id !== id)),
    [setScanHistory],
  );

  const clearScanHistory = useCallback(() => setScanHistory([]), [setScanHistory]);

  /* ---------------- Settings & demo data ---------------- */

  const updateSettings = useCallback(
    (nextSettings) => {
      setStoredSettings(withDefaults(nextSettings));
      logActivity('policy', 'Account settings updated');
    },
    [setStoredSettings, logActivity],
  );

  /** Restore every slice to the original sample data (keeps nothing). */
  const resetDemoData = useCallback(() => {
    setAlerts(createSampleAlerts());
    setNotifications(createSampleNotifications());
    setActivity(createSampleActivity());
    setScanHistory(createSampleScans());
    setStoredSettings(DEFAULT_SETTINGS);
  }, [setAlerts, setNotifications, setActivity, setScanHistory, setStoredSettings]);

  const value = useMemo(
    () => ({
      alerts,
      notifications,
      activity,
      scanHistory,
      settings,
      unreadCount: notifications.filter((n) => !n.read).length,
      openAlertCount: alerts.filter((a) => a.status !== 'Resolved').length,
      setAlertStatus,
      resolveAlert,
      deleteAlert,
      restoreSampleAlerts,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      logActivity,
      addScan,
      deleteScan,
      clearScanHistory,
      updateSettings,
      resetDemoData,
    }),
    [
      alerts,
      notifications,
      activity,
      scanHistory,
      settings,
      setAlertStatus,
      resolveAlert,
      deleteAlert,
      restoreSampleAlerts,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      logActivity,
      addScan,
      deleteScan,
      clearScanHistory,
      updateSettings,
      resetDemoData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Access the global app state. Must be used inside <AppProvider>. */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}
