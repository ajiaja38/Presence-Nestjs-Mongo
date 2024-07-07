import { Module } from '@nestjs/common';
import { RfidService } from './rfid.service';
import { RfidController } from './rfid.controller';
import { ClientsModule } from '@nestjs/microservices';
import { RMQ_CONFIG } from 'src/config/rmq.config';
import { MessageModule } from 'src/app/message/message.module';

@Module({
  imports: [ClientsModule.register([RMQ_CONFIG]), MessageModule],
  controllers: [RfidController],
  providers: [RfidService],
})
export class RfidModule {}
