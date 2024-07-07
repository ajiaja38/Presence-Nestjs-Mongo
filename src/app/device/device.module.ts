import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schema/device.schema';
import { TimezoneModule } from '../timezone/timezone.module';
import { MessageModule } from '../message/message.module';
import {
  TrxUserDevice,
  TrxUserDeviceSchema,
} from '../trx-user-device/schema/trx-user-device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: TrxUserDevice.name, schema: TrxUserDeviceSchema },
    ]),
    TimezoneModule,
    MessageModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
