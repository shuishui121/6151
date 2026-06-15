import { memo } from 'react';
import { Check } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { METRICS } from '@/data/metrics';
import { MetricOption } from '@/types';

export const MetricFilter = memo(function MetricFilter() {
  const selectedMetrics = useDashboardStore((state) => state.selectedMetrics);
  const toggleMetric = useDashboardStore((state) => state.toggleMetric);

  const isSelected = (metric: MetricOption) => {
    return selectedMetrics.some((m) => m.key === metric.key);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-400 text-sm font-medium mr-2">指标:</span>
      {METRICS.map((metric) => {
        const selected = isSelected(metric);
        return (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              selected
                ? 'border-transparent text-white shadow-lg'
                : 'border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            style={{
              backgroundColor: selected ? `${metric.color}20` : 'transparent',
              borderColor: selected ? metric.color : undefined,
              boxShadow: selected ? `0 0 20px ${metric.color}30` : undefined,
            }}
          >
            {selected && <Check className="w-3 h-3" style={{ color: metric.color }} />}
            <span
              style={{
                color: selected ? metric.color : undefined,
              }}
            >
              {metric.label}
            </span>
          </button>
        );
      })}
    </div>
  );
});
