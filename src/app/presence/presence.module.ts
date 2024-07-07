import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Presence, PresenceSchema } from './schema/presence.schema';
import { TimezoneModule } from '../timezone/timezone.module';
import { MessageModule } from '../message/message.module';
import {
  Institution,
  InstitutionSchema,
} from '../institution/schema/institution.schema';
import User, { UserSchema } from '../user/schema/user.schema';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { ExcelModule } from '../excel/excel.module';
import {
  Holiday,
  HolidaySchema,
} from '../scheduler/holiday/schema/holiday.schema';
import {
  DefaultSchedule,
  DefaultScheduleSchema,
} from '../scheduler/default-schedule/schema/defaultSchedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Presence.name, schema: PresenceSchema },
      { name: User.name, schema: UserSchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: DefaultSchedule.name, schema: DefaultScheduleSchema },
    ]),
    TimezoneModule,
    MessageModule,
    ExcelModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}
