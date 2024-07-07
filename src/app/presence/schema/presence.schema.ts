import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';
import { EPresenceStatus } from 'src/utils/types/enum/EPresenceStatus.enum';
import { IImageUrl } from 'src/utils/types/interface/IImageUrl.interface';
import { ILocationPresence } from 'src/utils/types/interface/ILocation.interface';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export class Presence {
  @Prop({
    type: String,
    unique: true,
    default: () => `presence-${uuidv4()}`,
  })
  guid: string;

  @Prop({
    type: String,
    required: true,
  })
  guidUser: string;

  @Prop({
    type: String,
    enum: EPresenceStatus,
    default: EPresenceStatus.ALPHA,
  })
  status: EPresenceStatus;

  @Prop({
    type: String,
    enum: EDevice,
    default: EDevice.DEFAULT,
  })
  presenceType: EDevice;

  @Prop({
    type: String,
    required: true,
  })
  guidInstitution: string;

  @Prop({
    type: String,
    required: true,
  })
  guidUnit: string;

  @Prop({
    type: String,
    default: null,
  })
  guidDevice: string;

  @Prop({
    type: String,
    default: null,
  })
  guidDevicePresence: string;

  @Prop({
    type: { imageCheckin: String, imageCheckout: String },
    _id: false,
    default: { imageCheckin: null, imageCheckout: null },
  })
  imageUrl: IImageUrl;

  @Prop({
    type: String,
    default: null,
  })
  description: string;

  @Prop({
    type: {
      locationCheckIn: {
        latitude: Number,
        longitude: Number,
      },
      locationCheckOut: {
        latitude: Number,
        longitude: Number,
      },
    },
    _id: false,
    default: {
      locationCheckIn: {
        latitude: null,
        longitude: null,
      },
      locationCheckOut: {
        latitude: null,
        longitude: null,
      },
    },
  })
  location: ILocationPresence;

  @Prop({
    type: String,
    default: null,
  })
  checkIn: string;

  @Prop({
    type: String,
    default: null,
  })
  checkOut: string;

  @Prop({
    type: Date,
    default: null,
  })
  createdAt: Date;
}

export const PresenceSchema = SchemaFactory.createForClass(Presence);
