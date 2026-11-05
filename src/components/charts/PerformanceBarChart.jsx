import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useChartTheme from '../../hooks/useChartTheme';
import ChartTooltip from './ChartTooltip';

/**
 * Security performance score per domain, with a dashed target line.
 * Bars below the target are drawn in amber so weak areas stand out.
 */
export default function PerformanceBarChart({ data, target = 80, height = 280 }) {
  const chartTheme = useChartTheme();
  const axisProps = { stroke: chartTheme.axis, tickLine: false, axisLine: false, fontSize: 12 };

  return (
    <div>
      {/* Legend: explains the dashed line and the two bar colours */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> At or above target
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-medium" /> Below target
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 border-t border-dashed border-muted" /> Target ({target})
        </span>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height }}>
          <BarChart data={data} margin={{ top: 18, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="area" {...axisProps} dy={8} interval={0} />
            <YAxis {...axisProps} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip content={<ChartTooltip valueSuffix="/100" />} cursor={{ fill: chartTheme.cursor }} />
            <ReferenceLine y={target} stroke={chartTheme.axis} strokeDasharray="5 5" ifOverflow="extendDomain" />
            <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {data.map((entry) => (
                <Cell key={entry.area} fill={entry.score >= target ? 'var(--sg-primary)' : '#eab308'} />
              ))}
              <LabelList dataKey="score" position="top" fill={chartTheme.axis} fontSize={11} offset={6} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
