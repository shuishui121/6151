import { memo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartDataPoint {
  name: string;
  value: number;
  athleteId?: string;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  animationDuration?: number;
  showGrid?: boolean;
  unit?: string;
  layout?: 'vertical' | 'horizontal';
}

export const BarChart = memo(function BarChart({
  data,
  height = 300,
  barColor = '#3B82F6',
  animationDuration = 800,
  showGrid = true,
  unit = 'm',
  layout = 'vertical',
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={barColor} stopOpacity={0.9} />
            <stop offset="100%" stopColor={barColor} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            opacity={0.3}
            horizontal={layout === 'vertical'}
            vertical={layout === 'horizontal'}
          />
        )}
        <XAxis
          type={layout === 'vertical' ? 'number' : 'category'}
          dataKey={layout === 'horizontal' ? 'name' : undefined}
          stroke="#64748B"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          domain={layout === 'vertical' ? ['auto', 'auto'] : undefined}
        />
        <YAxis
          type={layout === 'vertical' ? 'category' : 'number'}
          dataKey={layout === 'vertical' ? 'name' : undefined}
          stroke="#64748B"
          tick={{ fill: '#CBD5E1', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
          formatter={(value: number) => [`${value.toFixed(2)}${unit}`, '平均成绩']}
          cursor={{ fill: '#334155', opacity: 0.3 }}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          isAnimationActive
          animationDuration={animationDuration}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || `url(#barGradient)`}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
});
