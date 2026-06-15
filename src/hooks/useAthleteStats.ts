import { useMemo } from 'react';
import { AthleteStats } from '@/types';
import { calculateAthleteStats, getDateRange } from '@/utils/dataUtils';
import { getRecordsByDateRange } from '@/data/trainingRecords';

export const useAthleteStats = (
  athleteId: string,
  timeRangeType: 'week' | 'month'
): AthleteStats | null => {
  const stats = useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRangeType);
    const records = getRecordsByDateRange(startDate, endDate, athleteId);
    return calculateAthleteStats(athleteId, records);
  }, [athleteId, timeRangeType]);

  return stats;
};

export const useAllAthletesStats = (
  athleteIds: string[],
  timeRangeType: 'week' | 'month'
): Record<string, AthleteStats | null> => {
  return useMemo(() => {
    const result: Record<string, AthleteStats | null> = {};
    const { startDate, endDate } = getDateRange(timeRangeType);
    
    athleteIds.forEach((id) => {
      const records = getRecordsByDateRange(startDate, endDate, id);
      result[id] = calculateAthleteStats(id, records);
    });
    
    return result;
  }, [athleteIds, timeRangeType]);
};
