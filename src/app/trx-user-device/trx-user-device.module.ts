import { Module } from '@nestjs/common';
import { TrxUserDeviceService } from './trx-user-device.service';
import { TrxUserDeviceController } from './trx-user-device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrxUserDevice,
  TrxUserDeviceSchema,
} from './schema/trx-user-device.schema';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import User, { UserSchema } from '../user/schema/user.schema';
import { Device, DeviceSchema } from '../device/schema/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrxUserDevice.name, schema: TrxUserDeviceSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    UserModule,
    MessageModule,
  ],
  controllers: [TrxUserDeviceController],
  providers: [TrxUserDeviceService],
})
export class TrxUserDeviceModule {}
