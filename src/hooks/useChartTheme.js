import { useApp } from '../context/AppContext';

/**
 * Recharts needs concrete colour values for axes and grid lines,
 * so we map the current theme mode to a small palette here.
 */
export default function useChartTheme() {
  const { settings } = useApp();
  const isLight = settings.theme.mode === 'light';

  return {
    grid: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.1)',
    axis: isLight ? '#64748b' : '#7c8aa3',
    surface: isLight ? '#ffffff' : '#111a2e',
    cursor: isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(148, 163, 184, 0.08)',
  };
}
