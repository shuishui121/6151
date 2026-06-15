import { memo, useMemo } from 'react';
import { X, User, Ruler, Scale, Clock, Trophy, Target, Gauge } from 'lucide-react';
import { Athlete } from '@/types';
import { useDashboardStore, useSelectedMetricKeys } from '@/store/useDashboardStore';
import { useAthleteStats } from '@/hooks/useAthleteStats';
import { useTimeRangeData } from '@/hooks/useTimeRangeData';
import { RadarChart } from './charts/RadarChart';
import { AreaChart } from './charts/AreaChart';
import { generateRadarDataMemoized } from '@/utils/chartDataUtils';
import { formatDate } from '@/utils/dataUtils';
import { STATUS_COLORS, METRICS, getMetricByKey } from '@/data/metrics';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface AthleteDetailProps {
  athlete: Athlete;
}

export const AthleteDetail = memo(function AthleteDetail({ athlete }: AthleteDetailProps) {
  const setSelectedAthleteId = useDashboardStore((state) => state.setSelectedAthleteId);
  const timeRangeType = useDashboardStore((state) => state.timeRangeType);
  const selectedMetrics = useDashboardStore((state) => state.selectedMetrics);
  const selectedMetricKeys = useSelectedMetricKeys();

  const stats = useAthleteStats(athlete.id, timeRangeType);
  const { chartData } = useTimeRangeData(timeRangeType, {
    athleteId: athlete.id,
    metrics: selectedMetricKeys,
  });

  const radarData = useMemo(() => {
    return stats ? generateRadarDataMemoized(stats) : [];
  }, [stats]);

  const latestRecord = stats?.latestRecord;
  const animatedBarHeight = useAnimatedNumber(stats?.avgBarHeight || 0, {
    decimals: 2,
    duration: 600,
  });

  const statusConfig = STATUS_COLORS[athlete.status];

  const handleClose = () => {
    setSelectedAthleteId(null);
  };

  const InfoRow = ({ icon: Icon, label, value, unit = '', color = '#94A3B8' }: {
    icon: typeof User;
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <span className="font-medium" style={{ color }}>
        {value}
        {unit && <span className="text-slate-500 text-sm ml-1">{unit}</span>}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50">
      <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
          运动员详情
        </h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={athlete.avatar}
              alt={athlete.name}
              className="w-20 h-20 rounded-2xl border-3 border-slate-700 object-cover"
              style={{ borderWidth: '3px' }}
            />
            <div
              className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.border} border ${statusConfig.text}`}
            >
              {statusConfig.label}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {athlete.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold text-sky-400"
                style={{ fontFamily: "'Chakra Petch', sans-serif" }}
              >
                {animatedBarHeight.toFixed(2)}
              </span>
              <span className="text-slate-500">m 平均成绩</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <h4 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            基本信息
          </h4>
          <InfoRow icon={User} label="年龄" value={athlete.age} unit="岁" />
          <InfoRow icon={Ruler} label="身高" value={athlete.height} unit="cm" />
          <InfoRow icon={Scale} label="体重" value={athlete.weight} unit="kg" />
          <InfoRow icon={Trophy} label="训练年限" value={athlete.trainingYears} unit="年" />
        </div>

        {latestRecord && (
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <h4 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              最新训练记录
              <span className="text-slate-500 text-sm font-normal ml-auto">
                {formatDate(latestRecord.date, 'long')}
              </span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {METRICS.slice(0, 4).map((metric) => (
                <div key={metric.key} className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-slate-500 text-xs mb-1">{metric.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-lg font-bold"
                      style={{ color: metric.color, fontFamily: "'Chakra Petch', sans-serif" }}
                    >
                      {metric.key === 'barHeight' || metric.key === 'approachSpeed'
                        ? (latestRecord[metric.key] as number).toFixed(2)
                        : metric.key === 'takeoffAngle'
                        ? (latestRecord[metric.key] as number).toFixed(1)
                        : Math.round(latestRecord[metric.key] as number)}
                    </span>
                    <span className="text-slate-500 text-xs">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <h4 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            技术能力分析
          </h4>
          <RadarChart
            data={radarData}
            color="#F97316"
            height={260}
          />
        </div>

        {selectedMetrics.length > 0 && chartData.length > 0 && (
          <div className="space-y-6">
            <h4 className="text-slate-300 font-semibold flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              指标趋势
            </h4>
            {selectedMetrics.map((metric) => (
              <div
                key={metric.key}
                className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium text-sm">
                    {metric.label}
                  </span>
                  <span className="text-xs" style={{ color: metric.color }}>
                    {metric.unit}
                  </span>
                </div>
                <AreaChart
                  data={chartData}
                  metric={getMetricByKey(metric.key) || metric}
                  height={120}
                  showGrid={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
