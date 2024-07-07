import { Module } from '@nestjs/common';
import { TokenForgotPasswordService } from './token-forgot-password.service';
import { TokenForgotPasswordController } from './token-forgot-password.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TokenForgotPassword,
  TokenForgotPasswordSchema,
} from './schema/tokenForgotPassword.schema';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenForgotPassword.name, schema: TokenForgotPasswordSchema },
    ]),
    MessageModule,
  ],
  controllers: [TokenForgotPasswordController],
  providers: [TokenForgotPasswordService],
  exports: [TokenForgotPasswordService],
})
export class TokenForgotPasswordModule {}
