import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Holiday, HolidaySchema } from './schema/holiday.schema';
import { MessageModule } from 'src/app/message/message.module';
import { TimezoneModule } from 'src/app/timezone/timezone.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Holiday.name, schema: HolidaySchema }]),
    MessageModule,
    TimezoneModule,
  ],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
