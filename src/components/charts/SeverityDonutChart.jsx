import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SEVERITIES, SEVERITY_CONFIG } from '../../data/constants';
import useChartTheme from '../../hooks/useChartTheme';
import ChartTooltip from './ChartTooltip';

/**
 * Donut chart of vulnerabilities per severity with a legend that doubles
 * as a data table (label, count, share) so colour is never the only cue.
 * @param {{Critical:number, High:number, Medium:number, Low:number}} counts
 * @param {boolean} stacked - always place the legend under the donut
 */
export default function SeverityDonutChart({ counts, height = 220, centerLabel = 'Total', stacked = false }) {
  const chartTheme = useChartTheme();
  const data = SEVERITIES.map((severity) => ({
    name: severity,
    value: counts[severity] ?? 0,
    color: SEVERITY_CONFIG[severity].color,
  }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`flex flex-col items-center gap-6 ${stacked ? '' : 'sm:flex-row lg:flex-col 2xl:flex-row'}`}>
      <div className="relative w-full max-w-[220px] shrink-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 220, height }}>
          <PieChart>
            <Pie
              data={total ? data : [{ name: 'None', value: 1, color: chartTheme.grid }]}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="96%"
              paddingAngle={total ? 2 : 0}
              cornerRadius={4}
              stroke={chartTheme.surface}
              strokeWidth={2}
              isAnimationActive
            >
              {(total ? data : [{ color: chartTheme.grid }]).map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            {total > 0 && <Tooltip content={<ChartTooltip />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-ink tabular-nums">{total}</span>
          <span className="text-xs text-subtle">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((item) => {
          const share = total ? Math.round((item.value / total) * 100) : 0;
          const Icon = SEVERITY_CONFIG[item.name].icon;
          return (
            <li key={item.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-ink tabular-nums">
                  {item.value} <span className="font-normal text-subtle">({share}%)</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${share}%`, background: item.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
