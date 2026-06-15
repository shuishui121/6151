import { ChartDataPoint, MetricOption, TrainingRecord, AthleteStats, RadarDataPoint } from '@/types';
import { METRICS } from '@/data/metrics';
import { ATHLETES } from '@/data/athletes';

const formatDate = (dateStr: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateStr);
  if (format === 'short') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface MemoCacheEntry<V> {
  value: V;
  timestamp: number;
}

class MemoCache<V> {
  private cache = new Map<string, MemoCacheEntry<V>>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttl = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  private makeKey(args: unknown[]): string {
    try {
      return JSON.stringify(args, (_, val) => {
        if (typeof val === 'function') return val.toString();
        if (val instanceof Date) return val.toISOString();
        return val;
      });
    } catch {
      return String(args);
    }
  }

  get(keyParts: unknown[]): V | undefined {
    const key = this.makeKey(keyParts);
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(keyParts: unknown[], value: V): void {
    const key = this.makeKey(keyParts);
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  maxSize = 100,
  ttl = 60000
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new MemoCache<ReturnType<T>>(maxSize, ttl);
  return (...args: Parameters<T>): ReturnType<T> => {
    const cached = cache.get(args);
    if (cached !== undefined) {
      return cached as ReturnType<T>;
    }
    const result = fn(...args) as ReturnType<T>;
    cache.set(args, result);
    return result;
  };
};

export const formatMetricValue = (value: number, metric: MetricOption | { key: string; unit: string }): string => {
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

const calculateAverage = (records: TrainingRecord[], key: keyof TrainingRecord): number => {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, record) => acc + (record[key] as number), 0);
  return Math.round((sum / records.length) * 100) / 100;
};

const _aggregateByDate = (
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

export const aggregateByDateMemoized = memoize(_aggregateByDate, 50, 120000);

const _generateRadarData = (stats: Partial<AthleteStats>): RadarDataPoint[] => {
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

export const generateRadarDataMemoized = memoize(_generateRadarData, 30, 120000);

const _calculateTrend = (
  records: TrainingRecord[],
  key: keyof TrainingRecord
): { trend: 'improving' | 'stable' | 'declining'; value: number } => {
  if (records.length < 7) return { trend: 'stable', value: 0 };

  const midPoint = Math.floor(records.length / 2);
  const firstHalf = records.slice(0, midPoint);
  const secondHalf = records.slice(midPoint);

  const firstAvg = calculateAverage(firstHalf, key);
  const secondAvg = calculateAverage(secondHalf, key);

  const change = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (change > 2) trend = 'improving';
  else if (change < -2) trend = 'declining';

  return { trend, value: Math.round(change * 10) / 10 };
};

export const calculateTrendMemoized = memoize(_calculateTrend, 30, 120000);

const _calculateAthleteStats = (
  athleteId: string,
  records: TrainingRecord[]
): AthleteStats | null => {
  if (records.length === 0) return null;

  const latestRecord = records[records.length - 1];
  const barTrend = _calculateTrend(records, 'barHeight');

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

export const calculateAthleteStatsMemoized = memoize(_calculateAthleteStats, 30, 120000);

const _getBarRankings = (
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

export const getBarRankingsMemoized = memoize(_getBarRankings, 20, 120000);

const lttbDownsample = (
  data: ChartDataPoint[],
  dataKeys: string[],
  targetLength: number
): ChartDataPoint[] => {
  if (data.length <= targetLength || targetLength < 3) {
    return data;
  }

  const sampled: ChartDataPoint[] = [];
  sampled.push(data[0]);

  const bucketSize = (data.length - 2) / (targetLength - 2);
  let a = 0;

  for (let i = 0; i < targetLength - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeEndClamped = Math.min(avgRangeEnd, data.length);

    let avgX = 0;
    const avgY: Record<string, number> = {};
    dataKeys.forEach((k) => (avgY[k] = 0));
    const avgRangeLength = avgRangeEndClamped - avgRangeStart;

    for (let j = avgRangeStart; j < avgRangeEndClamped; j++) {
      avgX += j;
      dataKeys.forEach((k) => {
        avgY[k] += data[j][k] as number;
      });
    }
    avgX /= avgRangeLength;
    dataKeys.forEach((k) => (avgY[k] /= avgRangeLength));

    const rangeOffs = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    const pointA = data[a];
    let maxArea = -1;
    let nextA = a;

    for (let j = rangeOffs; j < rangeTo; j++) {
      let areaSum = 0;
      for (const key of dataKeys) {
        const ax = a;
        const ay = pointA[key] as number;
        const bx = avgX;
        const by = avgY[key];
        const cx = j;
        const cy = data[j][key] as number;

        const area =
          Math.abs((bx - ax) * (ay - cy) - (bx - cx) * (ay - by)) * 0.5;
        areaSum += area;
      }

      if (areaSum > maxArea) {
        maxArea = areaSum;
        nextA = j;
      }
    }

    sampled.push(data[nextA]);
    a = nextA;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
};

const _downsampleChartData = (
  data: ChartDataPoint[],
  metricKeys: string[],
  threshold: number = 500,
  targetRatio: number = 0.25
): ChartDataPoint[] => {
  if (data.length <= threshold) return data;

  const targetLength = Math.max(
    Math.ceil(data.length * targetRatio),
    Math.min(threshold, 200)
  );

  const keys = metricKeys.length > 0 ? metricKeys : Object.keys(data[0] || {}).filter((k) => k !== 'date');

  return lttbDownsample(data, keys, targetLength);
};

export const downsampleChartDataMemoized = memoize(_downsampleChartData, 20, 60000);

export const shouldDownsample = (dataLength: number, threshold: number = 500): boolean => {
  return dataLength > threshold;
};

export const getMetricByKey = (key: string): MetricOption | undefined => {
  return METRICS.find((m) => m.key === key);
};

const normalizeValue = (value: number, min: number, max: number): number => {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

const _getMetricNormalizedValue = (value: number, metricKey: string): number => {
  const metric = METRICS.find((m) => m.key === metricKey);
  if (!metric) return 0;
  return normalizeValue(value, metric.min, metric.max);
};

export const getMetricNormalizedValueMemoized = memoize(_getMetricNormalizedValue, 50, 120000);

export const shallowEqual = (objA: unknown, objB: unknown): boolean => {
  if (Object.is(objA, objB)) return true;

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const aKeys = Object.keys(objA as Record<string, unknown>);
  const bKeys = Object.keys(objB as Record<string, unknown>);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(
        (objA as Record<string, unknown>)[key],
        (objB as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
};
