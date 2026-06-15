export interface Athlete {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  trainingYears: number;
  avatar: string;
  status: 'excellent' | 'normal' | 'warning' | 'abnormal';
}

export interface TrainingRecord {
  id: string;
  athleteId: string;
  date: string;
  approachSpeed: number;
  takeoffAngle: number;
  barHeight: number;
  landingStability: number;
  rhythmScore: number;
  trainingDuration: number;
  notes?: string;
}

export interface TimeRange {
  type: 'week' | 'month';
  startDate: string;
  endDate: string;
}

export interface MetricOption {
  key: 'approachSpeed' | 'takeoffAngle' | 'barHeight' | 'landingStability' | 'rhythmScore' | 'trainingDuration';
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
}

export interface AthleteStats {
  athleteId: string;
  latestRecord: TrainingRecord;
  avgApproachSpeed: number;
  avgTakeoffAngle: number;
  avgBarHeight: number;
  avgLandingStability: number;
  avgRhythmScore: number;
  trend: 'improving' | 'stable' | 'declining';
  trendValue: number;
}

export interface TeamStats {
  totalAthletes: number;
  todayTrainingCount: number;
  avgBarHeight: number;
  bestBarHeight: number;
  avgApproachSpeed: number;
  abnormalCount: number;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface RadarDataPoint {
  metric: string;
  value: number;
  fullMark: number;
}
