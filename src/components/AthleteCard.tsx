import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import { Athlete, AthleteStats } from '@/types';
import { STATUS_COLORS, TREND_COLORS } from '@/data/metrics';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { staggerDelay } from '@/utils/animationUtils';
import { useDashboardStore } from '@/store/useDashboardStore';

interface AthleteCardProps {
  athlete: Athlete;
  stats: AthleteStats | null;
  delay?: number;
}

export const AthleteCard = memo(function AthleteCard({
  athlete,
  stats,
  delay = 0,
}: AthleteCardProps) {
  const selectedAthleteId = useDashboardStore((state) => state.selectedAthleteId);
  const setSelectedAthleteId = useDashboardStore((state) => state.setSelectedAthleteId);
  const toggleCompareAthlete = useDashboardStore((state) => state.toggleCompareAthlete);
  const compareAthleteIds = useDashboardStore((state) => state.compareAthleteIds);

  const isSelected = selectedAthleteId === athlete.id;
  const isCompare = compareAthleteIds.includes(athlete.id);
  const statusConfig = STATUS_COLORS[athlete.status];
  const barHeight = stats?.latestRecord.barHeight || 0;
  const animatedBarHeight = useAnimatedNumber(barHeight, { decimals: 2, duration: 600 });

  const getTrendIcon = () => {
    if (!stats) return <Minus className="w-4 h-4" />;
    if (stats.trend === 'improving') return <TrendingUp className="w-4 h-4" />;
    if (stats.trend === 'declining') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const handleClick = () => {
    setSelectedAthleteId(isSelected ? null : athlete.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompareAthlete(athlete.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl bg-slate-800/80 backdrop-blur-sm border p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 group ${
        isSelected
          ? 'border-orange-500/60 ring-2 ring-orange-500/30 bg-slate-800/90'
          : 'border-slate-700/50 hover:border-slate-600/80'
      } ${
        athlete.status === 'abnormal' ? 'animate-pulse' : ''
      }`}
      style={{
        animationDelay: `${staggerDelay(delay, 60)}ms`,
        animation: athlete.status === 'abnormal' ? undefined : 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${statusConfig.bg} transition-all duration-300`}
      />

      {isCompare && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold z-20">
          {compareAthleteIds.indexOf(athlete.id) + 1}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="relative">
          {athlete.avatar ? (
            <img
              src={athlete.avatar}
              alt={athlete.name}
              className="w-12 h-12 rounded-full border-2 border-slate-600 object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
              athlete.status === 'abnormal'
                ? 'bg-rose-500 animate-ping'
                : athlete.status === 'warning'
                ? 'bg-amber-500'
                : athlete.status === 'excellent'
                ? 'bg-emerald-500'
                : 'bg-sky-500'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-slate-50 font-semibold truncate drop-shadow-sm">{athlete.name}</h3>
            <span
              onClick={handleCompareClick}
              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                isCompare
                  ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700'
              }`}
            >
              {isCompare ? '对比中' : '对比'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
            {stats && (
              <div className={`flex items-center gap-1 text-xs ${TREND_COLORS[stats.trend]}`}>
                {getTrendIcon()}
                <span>{stats.trendValue > 0 ? '+' : ''}{stats.trendValue}%</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-bold text-sky-400"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              {animatedBarHeight.toFixed(2)}
            </span>
            <span className="text-slate-500 text-sm">m</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-orange-400 font-semibold text-sm">
              {stats.avgApproachSpeed.toFixed(1)}
            </div>
            <div className="text-slate-500 text-xs">速度</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-400 font-semibold text-sm">
              {stats.avgTakeoffAngle.toFixed(0)}°
            </div>
            <div className="text-slate-500 text-xs">角度</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-semibold text-sm">
              {stats.avgLandingStability.toFixed(0)}
            </div>
            <div className="text-slate-500 text-xs">稳定</div>
          </div>
        </div>
      )}
    </div>
  );
});
