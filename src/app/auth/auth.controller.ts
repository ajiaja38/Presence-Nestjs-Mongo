import { Body, Controller, Post, Put, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshtoken.dto';
import { ILoginResponse } from 'src/utils/types/interface/IAuthResponse.interface';
import { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginHandler(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<ILoginResponse> {
    const token: ILoginResponse = await this.authService.login(loginDto);
    response.setCookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return token;
  }

  @Put('refreshtoken')
  refreshTokenHandler(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
