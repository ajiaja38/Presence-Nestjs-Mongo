import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { MessageModule } from './app/message/message.module';
import { TimezoneModule } from './app/timezone/timezone.module';
import { UploaderModule } from './app/uploader/uploader.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionFilter } from './filter/exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './app/email/email.module';
import { TokenForgotPasswordModule } from './app/token-forgot-password/token-forgot-password.module';
import { RmqModule } from './app/rmq/rmq.module';
import { InstitutionModule } from './app/institution/institution.module';
import { TrxUserDeviceModule } from './app/trx-user-device/trx-user-device.module';
import { DeviceModule } from './app/device/device.module';
import { UnitModule } from './app/unit/unit.module';
import { PresenceModule } from './app/presence/presence.module';
import { ExcelModule } from './app/excel/excel.module';
import { CronjobsModule } from './app/cronjobs/cronjobs.module';
import { SchedulerModule } from './app/scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE),
    CacheModule.register({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_NAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_NAME,
      },
      preview: true,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    MessageModule,
    TimezoneModule,
    UploaderModule,
    EmailModule,
    TokenForgotPasswordModule,
    RmqModule,
    InstitutionModule,
    TrxUserDeviceModule,
    DeviceModule,
    UnitModule,
    PresenceModule,
    ExcelModule,
    CronjobsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
