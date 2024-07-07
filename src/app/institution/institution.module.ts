import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionController } from './institution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Institution, InstitutionSchema } from './schema/institution.schema';
import { MessageModule } from '../message/message.module';
import { TimezoneModule } from '../timezone/timezone.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Institution.name, schema: InstitutionSchema },
    ]),
    MessageModule,
    TimezoneModule,
  ],
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
