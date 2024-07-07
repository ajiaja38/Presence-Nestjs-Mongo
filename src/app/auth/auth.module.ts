import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from 'src/utils/constant/jwt.constant';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { TokenManagerService } from './token-manager/token-manager.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstant.accessTokenSecret,
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
    MessageModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenManagerService],
})
export class AuthModule {}
