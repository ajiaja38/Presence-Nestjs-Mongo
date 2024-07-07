import { Module } from '@nestjs/common';
import { DefaultScheduleModule } from './default-schedule/default-schedule.module';
import { HolidayModule } from './holiday/holiday.module';
import { ShiftingModule } from './shifting/shifting.module';

@Module({
  imports: [DefaultScheduleModule, HolidayModule, ShiftingModule],
})
export class SchedulerModule {}
