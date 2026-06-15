import { memo } from 'react';
import { Calendar, Clock, RefreshCw, Activity } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';

export const TimeRangePicker = memo(function TimeRangePicker() {
  const timeRangeType = useDashboardStore((state) => state.timeRangeType);
  const setTimeRangeType = useDashboardStore((state) => state.setTimeRangeType);
  const isLive = useDashboardStore((state) => state.isLive);
  const toggleLive = useDashboardStore((state) => state.toggleLive);
  const refreshData = useDashboardStore((state) => state.refreshData);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-1">
        <button
          onClick={() => setTimeRangeType('week')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            timeRangeType === 'week'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          本周
        </button>
        <button
          onClick={() => setTimeRangeType('month')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            timeRangeType === 'month'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          本月
        </button>
      </div>

      <button
        onClick={toggleLive}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
          isLive
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
            : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
        {isLive ? '实时中' : '实时'}
      </button>

      <button
        onClick={refreshData}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 text-sm font-medium transition-all duration-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-600"
      >
        <RefreshCw className="w-4 h-4" />
        刷新
      </button>
    </div>
  );
});
