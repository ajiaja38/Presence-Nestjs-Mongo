import { Module } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { DailyReportController } from './daily-report.controller';
import { ClientsModule } from '@nestjs/microservices';
import { RMQ_CONFIG } from 'src/config/rmq.config';
import { MessageModule } from 'src/app/message/message.module';

@Module({
  imports: [ClientsModule.register([RMQ_CONFIG]), MessageModule],
  controllers: [DailyReportController],
  providers: [DailyReportService],
})
export class DailyReportModule {}
