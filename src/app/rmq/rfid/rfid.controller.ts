import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RfidService } from './rfid.service';
import { RfidDto } from '../daily-report/dto/rfid.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('rfid')
@UseGuards(JwtAuthGuard)
export class RfidController {
  constructor(private readonly rfidService: RfidService) {}

  @Post()
  sendRfidMessageHandler(@Body() rfidDto: RfidDto): Promise<void> {
    return this.rfidService.sendRfidMessage(rfidDto);
  }
}
