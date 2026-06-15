import { useMemo } from 'react';
import { Users, Activity, Trophy, Zap, X } from 'lucide-react';
import { useDashboardStore, useSelectedMetricKeys } from '@/store/useDashboardStore';
import { ATHLETES, getAthleteById } from '@/data/athletes';
import { useTimeRangeData } from '@/hooks/useTimeRangeData';
import { useAllAthletesStats } from '@/hooks/useAthleteStats';
import { calculateTeamStats, getBarRankings, getDateRange } from '@/utils/dataUtils';
import { StatCard } from '@/components/StatCard';
import { AthleteCard } from '@/components/AthleteCard';
import { AthleteDetail } from '@/components/AthleteDetail';
import { TimeRangePicker } from '@/components/TimeRangePicker';
import { MetricFilter } from '@/components/MetricFilter';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { RadarChart } from '@/components/charts/RadarChart';
import { generateRadarData } from '@/utils/dataUtils';
import { METRICS } from '@/data/metrics';

export default function Home() {
  const timeRangeType = useDashboardStore((state) => state.timeRangeType);
  const selectedAthleteId = useDashboardStore((state) => state.selectedAthleteId);
  const selectedMetrics = useDashboardStore((state) => state.selectedMetrics);
  const compareAthleteIds = useDashboardStore((state) => state.compareAthleteIds);
  const clearCompareAthletes = useDashboardStore((state) => state.clearCompareAthletes);
  const selectedMetricKeys = useSelectedMetricKeys();
  const lastUpdate = useDashboardStore((state) => state.lastUpdate);

  const { records, chartData } = useTimeRangeData(timeRangeType, {
    metrics: selectedMetricKeys,
  });

  const allStats = useAllAthletesStats(
    ATHLETES.map((a) => a.id),
    timeRangeType
  );

  const teamStats = useMemo(() => {
    const { endDate } = getDateRange(timeRangeType);
    return calculateTeamStats(records, endDate);
  }, [records, timeRangeType, lastUpdate]);

  const rankings = useMemo(() => {
    return getBarRankings(records, 10);
  }, [records, lastUpdate]);

  const selectedAthlete = useMemo(() => {
    return selectedAthleteId ? getAthleteById(selectedAthleteId) : null;
  }, [selectedAthleteId]);

  const compareRadarData = useMemo(() => {
    return compareAthleteIds.map((id, index) => {
      const stats = allStats[id];
      const colors = ['#F97316', '#3B82F6', '#10B981'];
      const athlete = getAthleteById(id);
      return {
        data: stats ? generateRadarData(stats) : [],
        color: colors[index % colors.length],
        name: athlete?.name || '',
      };
    });
  }, [compareAthleteIds, allStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex">
          <div
            className={`flex-1 transition-all duration-500 ${
              selectedAthlete ? 'mr-96' : ''
            }`}
          >
            <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1
                        className="text-2xl font-bold gradient-text"
                        style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                      >
                        跳高训练数据仪表盘
                      </h1>
                      <p className="text-slate-400 text-sm">
                        市体校田径队 · 实时训练监控系统
                      </p>
                    </div>
                  </div>
                  <TimeRangePicker />
                </div>
                <MetricFilter />
              </div>
            </header>

            <main className="p-6 space-y-6">
              <section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                key={`stats-${lastUpdate}`}
              >
                <StatCard
                  title="运动员总数"
                  value={teamStats.totalAthletes}
                  icon={Users}
                  color="#3B82F6"
                  delay={0}
                />
                <StatCard
                  title="今日训练人次"
                  value={teamStats.todayTrainingCount}
                  icon={Activity}
                  color="#10B981"
                  delay={1}
                />
                <StatCard
                  title="平均过杆高度"
                  value={teamStats.avgBarHeight}
                  unit="m"
                  icon={Trophy}
                  color="#F97316"
                  decimals={2}
                  delay={2}
                />
                <StatCard
                  title="最佳成绩"
                  value={teamStats.bestBarHeight}
                  unit="m"
                  icon={Zap}
                  color="#8B5CF6"
                  decimals={2}
                  delay={3}
                  trend="up"
                  trendValue={3.2}
                />
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                    >
                      团队平均指标趋势
                    </h2>
                    <div className="text-slate-400 text-sm">
                      {timeRangeType === 'week' ? '最近7天' : '最近30天'}
                    </div>
                  </div>
                  <LineChart
                    data={chartData}
                    metrics={selectedMetrics}
                    height={320}
                  />
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                    >
                      过杆高度排名
                    </h2>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <BarChart
                    data={rankings.map((r, i) => ({
                      ...r,
                      color: i === 0 ? '#FBBF24' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#3B82F6',
                    }))}
                    height={320}
                    unit="m"
                  />
                </div>
              </section>

              {compareAthleteIds.length > 0 && (
                <section className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                      >
                        运动员对比分析
                      </h2>
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        {compareAthleteIds.length}/3
                      </span>
                    </div>
                    <button
                      onClick={clearCompareAthletes}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-400 text-sm hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      清空对比
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {compareRadarData.map((item, index) => (
                      <div key={compareAthleteIds[index]} className="bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-300 font-medium text-sm">
                            {item.name}
                          </span>
                        </div>
                        <RadarChart
                          data={item.data}
                          color={item.color}
                          height={220}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "'Chakra Petch', sans-serif" }}
                  >
                    运动员列表
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      优秀
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-sky-500" />
                      正常
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      警告
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      异常
                    </div>
                  </div>
                </div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  key={`athletes-${lastUpdate}`}
                >
                  {ATHLETES.map((athlete, index) => (
                    <AthleteCard
                      key={athlete.id}
                      athlete={athlete}
                      stats={allStats[athlete.id]}
                      delay={index}
                    />
                  ))}
                </div>
              </section>
            </main>
          </div>

          {selectedAthlete && (
            <div className="fixed top-0 right-0 h-full w-96 z-50 animate-slide-in-right">
              <AthleteDetail athlete={selectedAthlete} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
