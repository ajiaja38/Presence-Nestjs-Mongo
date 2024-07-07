import { Module } from '@nestjs/common';
import { DailyReportModule } from './daily-report/daily-report.module';
import { RfidModule } from './rfid/rfid.module';

@Module({
  imports: [DailyReportModule, RfidModule],
})
export class RmqModule {}
