import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageService } from 'src/app/message/message.service';
import { RfidDto } from '../daily-report/dto/rfid.dto';

@Injectable()
export class RfidService {
  constructor(
    @Inject('RMQ_SERVICE')
    private rmqClient: ClientProxy,

    private messageService: MessageService,
  ) {}

  async sendRfidMessage(rfidDto: RfidDto): Promise<void> {
    try {
      this.rmqClient.emit('presence', rfidDto);
      this.messageService.setMessage('Publish Rfid Successfully');
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }
}
