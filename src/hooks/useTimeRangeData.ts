import { useMemo } from 'react';
import { TrainingRecord, ChartDataPoint } from '@/types';
import { getDateRange } from '@/utils/dataUtils';
import {
  aggregateByDateMemoized,
  downsampleChartDataMemoized,
  shouldDownsample,
} from '@/utils/chartDataUtils';
import { getRecordsByDateRange } from '@/data/trainingRecords';

interface UseTimeRangeDataOptions {
  athleteId?: string;
  metrics: (keyof TrainingRecord)[];
}

export const useTimeRangeData = (
  timeRangeType: 'week' | 'month',
  options: UseTimeRangeDataOptions
) => {
  const { athleteId, metrics } = options;

  const { records, startDate, endDate } = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRangeType);
    const records = getRecordsByDateRange(startDate, endDate, athleteId);
    return { records, startDate, endDate };
  }, [timeRangeType, athleteId]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return aggregateByDateMemoized(records, metrics);
  }, [records, metrics]);

  const downsampledChartData: ChartDataPoint[] = useMemo(() => {
    if (shouldDownsample(chartData.length)) {
      return downsampleChartDataMemoized(
        chartData,
        metrics.map((m) => m as string),
        500,
        0.25
      );
    }
    return chartData;
  }, [chartData, metrics]);

  return {
    records,
    chartData,
    downsampledChartData,
    startDate,
    endDate,
    recordCount: records.length,
  };
};
