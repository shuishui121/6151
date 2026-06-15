import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { staggerDelay } from '@/utils/animationUtils';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  delay?: number;
  decimals?: number;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  unit = '',
  icon: Icon,
  color,
  trend,
  trendValue,
  delay = 0,
  decimals = 0,
}: StatCardProps) {
  const animatedValue = useAnimatedNumber(value, {
    duration: 800,
    decimals,
  });

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-5 transition-all duration-300 hover:border-slate-600/80 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 group"
      style={{
        animationDelay: `${staggerDelay(delay)}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          
          {trend && trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              <span className="text-lg">{getTrendIcon()}</span>
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              color,
            }}
          >
            {decimals > 0 ? animatedValue.toFixed(decimals) : Math.round(animatedValue)}
          </span>
          {unit && (
            <span className="text-slate-400 text-sm font-medium">{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
});
