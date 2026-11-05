import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PageLoader from './components/ui/PageLoader';

// Pages are code-split so each route only downloads what it needs.
const Overview = lazy(() => import('./pages/Overview'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Wrap a lazily loaded page with a loading fallback. */
const withLoader = (Page) => (
  <Suspense fallback={<PageLoader />}>
    <Page />
  </Suspense>
);

/** Route table - every page renders inside the dashboard shell. */
export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={withLoader(Overview)} />
        <Route path="scanner" element={withLoader(Scanner)} />
        <Route path="alerts" element={withLoader(Alerts)} />
        <Route path="reports" element={withLoader(Reports)} />
        <Route path="settings" element={withLoader(Settings)} />
        <Route path="*" element={withLoader(NotFound)} />
      </Route>
    </Routes>
  );
}
