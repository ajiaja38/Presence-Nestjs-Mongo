import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';

@Schema({
  versionKey: false,
})
export class TrxUserDevice {
  @Prop({
    type: String,
    unique: true,
  })
  guid: string;

  @Prop({
    type: String,
  })
  guidUser: string;

  @Prop({
    type: String,
  })
  macDevice: string;

  @Prop({
    type: String,
    enum: EDevice,
  })
  deviceType: EDevice;
}

export const TrxUserDeviceSchema = SchemaFactory.createForClass(TrxUserDevice);
