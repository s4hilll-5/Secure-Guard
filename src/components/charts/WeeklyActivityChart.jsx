import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from '../../data/constants';
import useChartTheme from '../../hooks/useChartTheme';
import ChartTooltip from './ChartTooltip';

const SERIES = [
  { key: 'detected', name: 'Detected', color: CHART_COLORS.detected },
  { key: 'resolved', name: 'Resolved', color: CHART_COLORS.resolved },
];

/** Legend rendered above the plot (identity is never colour-only: name + swatch). */
function SeriesLegend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
      {SERIES.map((series) => (
        <span key={series.key} className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full" style={{ background: series.color }} />
          {series.name}
        </span>
      ))}
    </div>
  );
}

/**
 * Detected vs resolved vulnerabilities per day.
 * variant="area" (Overview) or variant="line" (Reports & Analytics).
 */
export default function WeeklyActivityChart({ data, variant = 'area', height = 260 }) {
  const chartTheme = useChartTheme();
  const Chart = variant === 'area' ? AreaChart : LineChart;

  const axisProps = {
    stroke: chartTheme.axis,
    tickLine: false,
    axisLine: false,
    fontSize: 12,
  };

  return (
    <div>
      <SeriesLegend />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height }}>
          <Chart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              {SERIES.map((series) => (
                <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={series.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={series.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="day" {...axisProps} dy={8} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: chartTheme.axis, strokeDasharray: '4 4', strokeOpacity: 0.6 }}
            />
            {SERIES.map((series) =>
              variant === 'area' ? (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2}
                  fill={`url(#fill-${series.key})`}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: chartTheme.surface }}
                />
              ) : (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ r: 3.5, strokeWidth: 2, stroke: chartTheme.surface, fill: series.color }}
                  activeDot={{ r: 5.5, strokeWidth: 2, stroke: chartTheme.surface }}
                />
              ),
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
