import { EDay } from '../enum/EDay.enum';

export interface ISchedulePresence {
  start: string;
  end: string;
  nexDay: boolean;
}

export interface IDaySchedule {
  id: number;
  day: EDay;
}
