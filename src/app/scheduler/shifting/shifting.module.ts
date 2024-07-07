import { Module } from '@nestjs/common';
import { ShiftingService } from './shifting.service';
import { ShiftingController } from './shifting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shifting, ShiftingSchema } from './schema/shifting.schema';
import { TimezoneModule } from 'src/app/timezone/timezone.module';
import { MessageModule } from 'src/app/message/message.module';
import {
  Institution,
  InstitutionSchema,
} from 'src/app/institution/schema/institution.schema';
import { Unit, UnitSchema } from 'src/app/unit/schema/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shifting.name, schema: ShiftingSchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    TimezoneModule,
    MessageModule,
  ],
  controllers: [ShiftingController],
  providers: [ShiftingService],
})
export class ShiftingModule {}
