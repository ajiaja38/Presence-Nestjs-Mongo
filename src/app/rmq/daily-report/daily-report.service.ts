import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageService } from 'src/app/message/message.service';
import { DailyReportDto } from './dto/dailyReport.dto';

@Injectable()
export class DailyReportService {
  constructor(
    @Inject('RMQ_SERVICE')
    private rmqClient: ClientProxy,

    private messageService: MessageService,
  ) {}

  async sendDailyReportDto(dailyReportDto: DailyReportDto): Promise<void> {
    try {
      this.rmqClient.emit('daily-report', dailyReportDto);
      this.messageService.setMessage('Publish Daily Report Successfully');
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  }
}
