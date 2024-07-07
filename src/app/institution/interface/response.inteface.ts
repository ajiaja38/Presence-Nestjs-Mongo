import { EDay } from 'src/utils/types/enum/EDay.enum';
import { EInstitution } from 'src/utils/types/enum/EInstitution.enum';
import { ISchedulePresence } from 'src/utils/types/interface/IDefaultSchedule.interface';
import { ILocation } from 'src/utils/types/interface/ILocation.interface';

export interface IInstitutionDetail {
  guid: string;
  name: string;
  type: EInstitution;
  address: string;
  location: ILocation;
  trajectory: ILocation[];
  daySchedule: { id: number; day: EDay }[];
  schedulePresence: {
    checkInTime: ISchedulePresence;
    checkOutTime: ISchedulePresence;
  };
  totalUnit: number;
  totalMember: number;
  totalDevice: number;
  createdAt: string;
  updatedAt: string;
}
