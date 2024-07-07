import { Module } from '@nestjs/common';
import { DefaultScheduleService } from './default-schedule.service';
import { DefaultScheduleController } from './default-schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DefaultSchedule,
  DefaultScheduleSchema,
} from './schema/defaultSchedule.schema';
import { TimezoneModule } from 'src/app/timezone/timezone.module';
import { MessageModule } from 'src/app/message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DefaultSchedule.name, schema: DefaultScheduleSchema },
    ]),
    TimezoneModule,
    MessageModule,
  ],
  controllers: [DefaultScheduleController],
  providers: [DefaultScheduleService],
})
export class DefaultScheduleModule {}
