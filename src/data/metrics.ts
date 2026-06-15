import { MetricOption } from '@/types';

export const METRICS: MetricOption[] = [
  {
    key: 'approachSpeed',
    label: '助跑速度',
    unit: 'm/s',
    color: '#F97316',
    min: 6,
    max: 10,
  },
  {
    key: 'takeoffAngle',
    label: '起跳角度',
    unit: '°',
    color: '#10B981',
    min: 30,
    max: 50,
  },
  {
    key: 'barHeight',
    label: '过杆高度',
    unit: 'm',
    color: '#3B82F6',
    min: 1.5,
    max: 2.2,
  },
  {
    key: 'landingStability',
    label: '落地稳定性',
    unit: '分',
    color: '#8B5CF6',
    min: 0,
    max: 100,
  },
  {
    key: 'rhythmScore',
    label: '节奏评分',
    unit: '分',
    color: '#EC4899',
    min: 0,
    max: 100,
  },
  {
    key: 'trainingDuration',
    label: '训练时长',
    unit: 'min',
    color: '#F59E0B',
    min: 30,
    max: 120,
  },
];

export const getMetricByKey = (key: string): MetricOption | undefined => {
  return METRICS.find((m) => m.key === key);
};

export const STATUS_COLORS = {
  excellent: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    label: '优秀',
  },
  normal: {
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/50',
    text: 'text-sky-400',
    label: '正常',
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    label: '警告',
  },
  abnormal: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    label: '异常',
  },
};

export const TREND_COLORS = {
  improving: 'text-emerald-400',
  stable: 'text-slate-400',
  declining: 'text-rose-400',
};
