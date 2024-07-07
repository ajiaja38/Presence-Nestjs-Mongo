import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISchedulePresence } from 'src/utils/types/interface/IDefaultSchedule.interface';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export class Shifting {
  @Prop({
    type: String,
    unique: true,
    default: () => `shifting-${uuidv4()}`,
  })
  guid: string;

  @Prop({
    type: String,
    required: true,
  })
  guidInstitution: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: {
      checkInTime: { start: String, end: String, nextDay: Boolean },
      checkOutTime: { start: String, end: String, nextDay: Boolean },
    },
    default: {
      checkInTime: { start: null, end: null, nextDay: false },
      checkOutTime: { start: null, end: null, nextDay: false },
      nextDay: false,
    },
    _id: false,
  })
  presenceTime: {
    checkInTime: ISchedulePresence;
    checkOutTime: ISchedulePresence;
  };

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

export const ShiftingSchema = SchemaFactory.createForClass(Shifting);
