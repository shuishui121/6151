import { memo } from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { RadarDataPoint } from '@/types';
import { shallowEqual } from '@/utils/chartDataUtils';

interface RadarChartProps {
  data: RadarDataPoint[];
  color?: string;
  height?: number;
  animationDuration?: number;
  showLegend?: boolean;
  legendName?: string;
}

function RadarChartInner({
  data,
  color = '#F97316',
  height = 280,
  animationDuration = 800,
  showLegend = false,
  legendName = '技术指标',
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart
        cx="50%"
        cy="50%"
        outerRadius="70%"
        data={data}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </radialGradient>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <PolarGrid
          stroke="#334155"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="metric"
          tick={{
            fill: '#CBD5E1',
            fontSize: 12,
            fontWeight: 500,
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{
            fill: '#64748B',
            fontSize: 10,
          }}
          axisLine={false}
          tickCount={5}
        />
        <Radar
          name={legendName}
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#radarFill)"
          filter="url(#radarGlow)"
          dot={{
            fill: color,
            stroke: '#fff',
            strokeWidth: 2,
            r: 4,
          }}
          isAnimationActive
          animationDuration={animationDuration}
          animationEasing="ease-out"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }}
          formatter={(value: number) => [`${value}分`, '得分']}
          labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={() => (
              <span className="text-slate-300 text-sm">{legendName}</span>
            )}
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

export const RadarChart = memo(RadarChartInner, shallowEqual);
