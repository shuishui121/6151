import { TrainingRecord } from '@/types';
import { ATHLETES } from './athletes';

const generateTrainingRecord = (
  athleteId: string,
  date: string,
  baseValues: {
    approachSpeed: number;
    takeoffAngle: number;
    barHeight: number;
    landingStability: number;
    rhythmScore: number;
  },
  dayOffset: number
): TrainingRecord => {
  const trendFactor = Math.sin(dayOffset / 7) * 0.1 + 1;
  const randomFactor = () => 0.9 + Math.random() * 0.2;

  return {
    id: `${athleteId}-${date}`,
    athleteId,
    date,
    approachSpeed: Math.round(baseValues.approachSpeed * trendFactor * randomFactor() * 100) / 100,
    takeoffAngle: Math.round(baseValues.takeoffAngle * trendFactor * randomFactor() * 10) / 10,
    barHeight: Math.round(baseValues.barHeight * trendFactor * randomFactor() * 100) / 100,
    landingStability: Math.round(baseValues.landingStability * trendFactor * randomFactor()),
    rhythmScore: Math.round(baseValues.rhythmScore * trendFactor * randomFactor()),
    trainingDuration: 60 + Math.floor(Math.random() * 40),
  };
};

const athleteBaseValues: Record<string, {
  approachSpeed: number;
  takeoffAngle: number;
  barHeight: number;
  landingStability: number;
  rhythmScore: number;
}> = {};

ATHLETES.forEach((athlete) => {
  const skillVariation = Math.random();
  athleteBaseValues[athlete.id] = {
    approachSpeed: 7.5 + skillVariation * 1.5,
    takeoffAngle: 38 + skillVariation * 6,
    barHeight: 1.7 + skillVariation * 0.35,
    landingStability: 65 + skillVariation * 25,
    rhythmScore: 60 + skillVariation * 30,
  };
});

const generateDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const TRAINING_RECORDS: TrainingRecord[] = [];

const DAYS_TO_GENERATE = 30;

for (let dayOffset = DAYS_TO_GENERATE - 1; dayOffset >= 0; dayOffset--) {
  const date = generateDateString(dayOffset);
  
  ATHLETES.forEach((athlete) => {
    if (Math.random() > 0.1 || dayOffset < 2) {
      const record = generateTrainingRecord(
        athlete.id,
        date,
        athleteBaseValues[athlete.id],
        dayOffset
      );
      TRAINING_RECORDS.push(record);
    }
  });
}

export const getRecordsByAthleteId = (athleteId: string): TrainingRecord[] => {
  return TRAINING_RECORDS.filter((r) => r.athleteId === athleteId).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getRecordsByDateRange = (
  startDate: string,
  endDate: string,
  athleteId?: string
): TrainingRecord[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return TRAINING_RECORDS.filter((r) => {
    const recordDate = new Date(r.date).getTime();
    const dateMatch = recordDate >= start && recordDate <= end;
    const athleteMatch = athleteId ? r.athleteId === athleteId : true;
    return dateMatch && athleteMatch;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getLatestRecordByAthleteId = (athleteId: string): TrainingRecord | undefined => {
  const records = getRecordsByAthleteId(athleteId);
  return records[records.length - 1];
};
