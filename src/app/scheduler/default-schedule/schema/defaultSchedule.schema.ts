import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDaySchedule } from 'src/utils/types/interface/IDefaultSchedule.interface';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export class DefaultSchedule {
  @Prop({
    type: String,
    unique: true,
    default: () => `dfs-${uuidv4()}`,
  })
  guid: string;

  @Prop({
    type: String,
    required: true,
  })
  guidInstitution: string;

  @Prop({
    type: [
      {
        id: Number,
        day: String,
      },
    ],
    _id: false,
  })
  daySchedule: IDaySchedule[];

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

export const DefaultScheduleSchema =
  SchemaFactory.createForClass(DefaultSchedule);
