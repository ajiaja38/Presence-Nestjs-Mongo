import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import User, { UserSchema } from './schema/user.schema';
import { PasswordConfService } from './password-conf.service';
import { MessageModule } from '../message/message.module';
import { TimezoneModule } from '../timezone/timezone.module';
import { EmailModule } from '../email/email.module';
import { TokenForgotPasswordModule } from '../token-forgot-password/token-forgot-password.module';
import { InstitutionModule } from '../institution/institution.module';
import {
  TrxUserDevice,
  TrxUserDeviceSchema,
} from '../trx-user-device/schema/trx-user-device.schema';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { ExcelModule } from '../excel/excel.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TrxUserDevice.name, schema: TrxUserDeviceSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    TokenForgotPasswordModule,
    EmailModule,
    MessageModule,
    TimezoneModule,
    InstitutionModule,
    ExcelModule,
  ],
  controllers: [UserController],
  providers: [UserService, PasswordConfService],
  exports: [UserService, PasswordConfService],
})
export class UserModule {}
