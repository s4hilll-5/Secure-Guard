import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/constants';
import { NAV_ITEMS } from '../data/navigation';

/** App shell: sidebar + top bar + routed page content. */
export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEYS.sidebar, false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Scroll to top and update the browser tab title on every route change.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const page = NAV_ITEMS.find((item) =>
      item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path),
    );
    document.title = `${page ? page.label : 'Page not found'} | SecureGuard`;
  }, [location.pathname]);

  // Close the mobile drawer when the viewport grows to desktop size.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = (event) => event.matches && setMobileOpen(false);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-line px-4 py-4 text-center text-xs text-subtle sm:px-6 lg:px-8">
          SecureGuard is a frontend demonstration. All data, scans and alerts are simulated sample data.
        </footer>
      </div>
    </div>
  );
}
