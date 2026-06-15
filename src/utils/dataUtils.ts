import { TrainingRecord, ChartDataPoint, RadarDataPoint, AthleteStats, TeamStats } from '@/types';
import { ATHLETES } from '@/data/athletes';
import { METRICS } from '@/data/metrics';

export const formatDate = (dateStr: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateStr);
  if (format === 'short') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const calculateAverage = (records: TrainingRecord[], key: keyof TrainingRecord): number => {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, record) => acc + (record[key] as number), 0);
  return Math.round((sum / records.length) * 100) / 100;
};

export const calculateTrend = (
  records: TrainingRecord[],
  key: keyof TrainingRecord
): { trend: 'improving' | 'stable' | 'declining'; value: number } => {
  if (records.length < 7) return { trend: 'stable', value: 0 };

  const midPoint = Math.floor(records.length / 2);
  const firstHalf = records.slice(0, midPoint);
  const secondHalf = records.slice(midPoint);

  const firstAvg = calculateAverage(firstHalf, key);
  const secondAvg = calculateAverage(secondHalf, key);

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (change > 2) trend = 'improving';
  else if (change < -2) trend = 'declining';

  return { trend, value: Math.round(change * 10) / 10 };
};

export const aggregateByDate = (
  records: TrainingRecord[],
  keys: (keyof TrainingRecord)[]
): ChartDataPoint[] => {
  const groupedByDate: Record<string, TrainingRecord[]> = {};

  records.forEach((record) => {
    if (!groupedByDate[record.date]) {
      groupedByDate[record.date] = [];
    }
    groupedByDate[record.date].push(record);
  });

  return Object.entries(groupedByDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, dayRecords]) => {
      const point: ChartDataPoint = { date: formatDate(date) };
      keys.forEach((key) => {
        point[key as string] = calculateAverage(dayRecords, key);
      });
      return point;
    });
};

export const generateRadarData = (stats: Partial<AthleteStats>): RadarDataPoint[] => {
  return [
    {
      metric: '助跑速度',
      value: stats.avgApproachSpeed
        ? Math.round(((stats.avgApproachSpeed - 6) / 4) * 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: '起跳角度',
      value: stats.avgTakeoffAngle
        ? Math.round(((stats.avgTakeoffAngle - 30) / 20) * 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: '过杆高度',
      value: stats.avgBarHeight
        ? Math.round(((stats.avgBarHeight - 1.5) / 0.7) * 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: '落地稳定',
      value: stats.avgLandingStability || 0,
      fullMark: 100,
    },
    {
      metric: '节奏评分',
      value: stats.avgRhythmScore || 0,
      fullMark: 100,
    },
  ];
};

export const calculateAthleteStats = (
  athleteId: string,
  records: TrainingRecord[]
): AthleteStats | null => {
  if (records.length === 0) return null;

  const latestRecord = records[records.length - 1];
  const barTrend = calculateTrend(records, 'barHeight');

  return {
    athleteId,
    latestRecord,
    avgApproachSpeed: calculateAverage(records, 'approachSpeed'),
    avgTakeoffAngle: calculateAverage(records, 'takeoffAngle'),
    avgBarHeight: calculateAverage(records, 'barHeight'),
    avgLandingStability: calculateAverage(records, 'landingStability'),
    avgRhythmScore: calculateAverage(records, 'rhythmScore'),
    trend: barTrend.trend,
    trendValue: barTrend.value,
  };
};

export const calculateTeamStats = (
  allRecords: TrainingRecord[],
  today: string
): TeamStats => {
  const todayRecords = allRecords.filter((r) => r.date === today);
  const abnormalAthletes = ATHLETES.filter((a) => a.status === 'abnormal').length;

  return {
    totalAthletes: ATHLETES.length,
    todayTrainingCount: todayRecords.length,
    avgBarHeight: calculateAverage(allRecords, 'barHeight'),
    bestBarHeight: Math.max(...allRecords.map((r) => r.barHeight)),
    avgApproachSpeed: calculateAverage(allRecords, 'approachSpeed'),
    abnormalCount: abnormalAthletes,
  };
};

export const getDateRange = (type: 'week' | 'month'): { type: 'week' | 'month'; startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();
  
  if (type === 'week') {
    start.setDate(end.getDate() - 6);
  } else {
    start.setDate(end.getDate() - 29);
  }

  return {
    type,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

export const getBarRankings = (
  records: TrainingRecord[],
  topN: number = 10
): { name: string; value: number; athleteId: string }[] => {
  const athleteBars: Record<string, { total: number; count: number; name: string }> = {};

  records.forEach((record) => {
    if (!athleteBars[record.athleteId]) {
      const athlete = ATHLETES.find((a) => a.id === record.athleteId);
      athleteBars[record.athleteId] = {
        total: 0,
        count: 0,
        name: athlete?.name || '未知',
      };
    }
    athleteBars[record.athleteId].total += record.barHeight;
    athleteBars[record.athleteId].count += 1;
  });

  return Object.entries(athleteBars)
    .map(([athleteId, data]) => ({
      athleteId,
      name: data.name,
      value: Math.round((data.total / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const normalizeValue = (value: number, min: number, max: number): number => {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

export const getMetricNormalizedValue = (
  value: number,
  metricKey: string
): number => {
  const metric = METRICS.find((m) => m.key === metricKey);
  if (!metric) return 0;
  return normalizeValue(value, metric.min, metric.max);
};
