import { useMemo } from 'react';
import { TrainingRecord, ChartDataPoint } from '@/types';
import { aggregateByDate, getDateRange } from '@/utils/dataUtils';
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
    return aggregateByDate(records, metrics);
  }, [records, metrics]);

  return {
    records,
    chartData,
    startDate,
    endDate,
    recordCount: records.length,
  };
};
