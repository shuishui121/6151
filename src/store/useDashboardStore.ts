import { create } from 'zustand';
import { TimeRange, MetricOption, TrainingRecord } from '@/types';
import { getDateRange } from '@/utils/dataUtils';
import { METRICS } from '@/data/metrics';

interface DashboardState {
  timeRange: TimeRange;
  timeRangeType: 'week' | 'month';
  selectedAthleteId: string | null;
  selectedMetrics: MetricOption[];
  compareAthleteIds: string[];
  isLive: boolean;
  setTimeRangeType: (type: 'week' | 'month') => void;
  setSelectedAthleteId: (id: string | null) => void;
  toggleMetric: (metric: MetricOption) => void;
  toggleCompareAthlete: (athleteId: string) => void;
  clearCompareAthletes: () => void;
  toggleLive: () => void;
  refreshData: () => void;
  lastUpdate: number;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  timeRangeType: 'week',
  timeRange: getDateRange('week'),
  selectedAthleteId: null,
  selectedMetrics: METRICS.slice(0, 3),
  compareAthleteIds: [],
  isLive: false,
  lastUpdate: Date.now(),

  setTimeRangeType: (type) => {
    set({
      timeRangeType: type,
      timeRange: getDateRange(type),
      lastUpdate: Date.now(),
    });
  },

  setSelectedAthleteId: (id) => {
    set({
      selectedAthleteId: id,
    });
  },

  toggleMetric: (metric) => {
    const { selectedMetrics } = get();
    const isSelected = selectedMetrics.some((m) => m.key === metric.key);
    
    if (isSelected) {
      if (selectedMetrics.length > 1) {
        set({
          selectedMetrics: selectedMetrics.filter((m) => m.key !== metric.key),
          lastUpdate: Date.now(),
        });
      }
    } else {
      set({
        selectedMetrics: [...selectedMetrics, metric],
        lastUpdate: Date.now(),
      });
    }
  },

  toggleCompareAthlete: (athleteId) => {
    const { compareAthleteIds } = get();
    const isSelected = compareAthleteIds.includes(athleteId);
    
    if (isSelected) {
      set({
        compareAthleteIds: compareAthleteIds.filter((id) => id !== athleteId),
      });
    } else if (compareAthleteIds.length < 3) {
      set({
        compareAthleteIds: [...compareAthleteIds, athleteId],
      });
    }
  },

  clearCompareAthletes: () => {
    set({
      compareAthleteIds: [],
    });
  },

  toggleLive: () => {
    set((state) => ({
      isLive: !state.isLive,
    }));
  },

  refreshData: () => {
    set({
      lastUpdate: Date.now(),
    });
  },
}));

export const useSelectedMetricKeys = (): (keyof TrainingRecord)[] => {
  const selectedMetrics = useDashboardStore((state) => state.selectedMetrics);
  return selectedMetrics.map((m) => m.key);
};
