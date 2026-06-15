import { memo } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint, MetricOption } from '@/types';

interface AreaChartProps {
  data: ChartDataPoint[];
  metric: MetricOption;
  height?: number;
  animationDuration?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const AreaChart = memo(function AreaChart({
  data,
  metric,
  height = 250,
  animationDuration = 800,
  showGrid = true,
  showLegend = false,
}: AreaChartProps) {
  const formatValue = (value: number): string => {
    if (metric.key === 'barHeight') {
      return `${value.toFixed(2)}${metric.unit}`;
    }
    if (metric.key === 'approachSpeed') {
      return `${value.toFixed(2)}${metric.unit}`;
    }
    if (metric.key === 'takeoffAngle') {
      return `${value.toFixed(1)}${metric.unit}`;
    }
    return `${Math.round(value)}${metric.unit}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id={`areaGradient-${metric.key}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={metric.color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={metric.color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            opacity={0.3}
          />
        )}
        <XAxis
          dataKey="date"
          stroke="#64748B"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          stroke="#64748B"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          domain={[metric.min, metric.max]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
          formatter={(value: number) => [formatValue(value), metric.label]}
        />
        {showLegend && (
          <Legend
            formatter={() => (
              <span className="text-slate-300 text-sm">{metric.label}</span>
            )}
          />
        )}
        <Area
          type="monotone"
          dataKey={metric.key}
          stroke={metric.color}
          strokeWidth={2}
          fill={`url(#areaGradient-${metric.key})`}
          dot={{
            fill: metric.color,
            strokeWidth: 0,
            r: 3,
          }}
          activeDot={{
            r: 5,
            fill: metric.color,
            stroke: '#fff',
            strokeWidth: 2,
          }}
          isAnimationActive
          animationDuration={animationDuration}
          animationEasing="ease-out"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
});
