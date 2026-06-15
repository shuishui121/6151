import { Athlete } from '@/types';

const athleteNames = [
  '张伟', '李明', '王强', '刘洋', '陈杰',
  '杨帆', '黄磊', '周涛', '吴鹏', '郑浩',
  '孙浩', '马超', '朱宇', '胡军', '林峰',
  '徐峰', '何凯', '高峰', '罗亮', '梁超',
  '宋阳', '唐磊', '韩冰', '冯锐',
];

export const ATHLETES: Athlete[] = athleteNames.map((name, index) => {
  const id = `A${String(index + 1).padStart(3, '0')}`;
  const statusRoll = Math.random();
  let status: Athlete['status'];
  
  if (statusRoll < 0.15) {
    status = 'excellent';
  } else if (statusRoll < 0.7) {
    status = 'normal';
  } else if (statusRoll < 0.9) {
    status = 'warning';
  } else {
    status = 'abnormal';
  }

  return {
    id,
    name,
    age: 16 + Math.floor(Math.random() * 6),
    height: 175 + Math.floor(Math.random() * 20),
    weight: 60 + Math.floor(Math.random() * 15),
    trainingYears: 2 + Math.floor(Math.random() * 6),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    status,
  };
});

export const getAthleteById = (id: string): Athlete | undefined => {
  return ATHLETES.find((a) => a.id === id);
};
