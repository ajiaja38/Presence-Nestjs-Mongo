import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EInstitution } from 'src/utils/types/enum/EInstitution.enum';
import { ILocation } from 'src/utils/types/interface/ILocation.interface';

@Schema({
  versionKey: false,
})
export class Institution {
  @Prop({
    type: String,
    unique: true,
  })
  guid: string;

  @Prop({
    type: String,
    unique: true,
  })
  name: string;

  @Prop({
    type: String,
    enum: EInstitution,
  })
  type: EInstitution;

  @Prop({
    type: String,
    default: null,
  })
  address: string;

  @Prop({
    type: { latitude: Number, longitude: Number },
    _id: false,
    default: { latitude: 0, longitude: 0 },
  })
  location: ILocation;

  @Prop({
    type: [{ latitude: Number, longitude: Number }],
    _id: false,
    default: [],
  })
  trajectory?: ILocation[];

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

export const InstitutionSchema = SchemaFactory.createForClass(Institution);
