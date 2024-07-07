import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({
  versionKey: false,
})
export class Unit {
  @Prop({
    type: String,
    unique: true,
    default: () => `unit-${uuidv4()}`,
  })
  guid: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  guidInstitution: string;

  @Prop({
    type: String,
    required: true,
  })
  guidShift: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: () => new Date(),
  })
  updatedAt: Date;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
