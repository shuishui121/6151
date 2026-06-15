import { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint, MetricOption } from '@/types';

interface LineChartProps {
  data: ChartDataPoint[];
  metrics: MetricOption[];
  height?: number;
  animationDuration?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const LineChart = memo(function LineChart({
  data,
  metrics,
  height = 300,
  animationDuration = 800,
  showGrid = true,
  showLegend = true,
}: LineChartProps) {
  const formatValue = (value: number, metric: MetricOption): string => {
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
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {metrics.map((metric) => (
            <linearGradient
              key={`gradient-${metric.key}`}
              id={`lineGradient-${metric.key}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor={metric.color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={metric.color} stopOpacity={1} />
            </linearGradient>
          ))}
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
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          stroke="#64748B"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
          formatter={(value: number, name: string) => {
            const metric = metrics.find((m) => m.key === name);
            return metric
              ? [formatValue(value, metric), metric.label]
              : [value, name];
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value: string) => {
              const metric = metrics.find((m) => m.key === value);
              return (
                <span className="text-slate-300 text-sm">
                  {metric?.label || value}
                </span>
              );
            }}
          />
        )}
        {metrics.map((metric) => (
          <Line
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={`url(#lineGradient-${metric.key})`}
            strokeWidth={2.5}
            dot={{
              fill: metric.color,
              strokeWidth: 2,
              r: 4,
              className: 'animate-pulse',
            }}
            activeDot={{
              r: 6,
              fill: metric.color,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            isAnimationActive
            animationDuration={animationDuration}
            animationEasing="ease-in-out"
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
});
