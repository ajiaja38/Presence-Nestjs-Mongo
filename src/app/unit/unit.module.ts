import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Unit, UnitSchema } from './schema/unit.schema';
import { TimezoneModule } from '../timezone/timezone.module';
import { MessageModule } from '../message/message.module';
import {
  Institution,
  InstitutionSchema,
} from '../institution/schema/institution.schema';
import { ExcelModule } from '../excel/excel.module';
import User, { UserSchema } from '../user/schema/user.schema';
import { UserModule } from '../user/user.module';
import {
  Shifting,
  ShiftingSchema,
} from '../scheduler/shifting/schema/shifting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unit.name, schema: UnitSchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: User.name, schema: UserSchema },
      { name: Shifting.name, schema: ShiftingSchema },
    ]),
    TimezoneModule,
    MessageModule,
    ExcelModule,
    UserModule,
  ],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
