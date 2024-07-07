import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { DailyReportDto } from './dto/dailyReport.dto';

@Controller('daily-report')
@UseGuards(JwtAuthGuard)
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Post()
  sendDailyReportHandler(
    @Body() dailyReportDto: DailyReportDto,
  ): Promise<void> {
    return this.dailyReportService.sendDailyReportDto(dailyReportDto);
  }
}
