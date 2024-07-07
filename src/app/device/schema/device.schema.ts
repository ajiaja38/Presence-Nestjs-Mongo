import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';

@Schema({
  versionKey: false,
})
export class Device {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  mac: string;

  @Prop({
    type: String,
    required: true,
  })
  location: string;

  @Prop({
    type: String,
    required: true,
  })
  guidInstitution: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  status: boolean;

  @Prop({
    type: String,
    enum: EDevice,
    required: true,
  })
  type: EDevice;

  @Prop({
    type: String,
    required: true,
  })
  deviceImage: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
