import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstant } from 'src/utils/constant/jwt.constant';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';

@Injectable()
export class TokenManagerService {
  constructor(private jwtService: JwtService) {}

  async generateAccessToken(iJwtPayload: IJwtPayload): Promise<string> {
    return await this.jwtService.signAsync({ ...iJwtPayload });
  }

  async generateRefreshToken(iJwtPayload: IJwtPayload): Promise<string> {
    return await this.jwtService.signAsync(
      { ...iJwtPayload },
      { secret: jwtConstant.refreshTokenSecret, expiresIn: '7d' },
    );
  }

  async verifyRefreshToken(refreshToken: string): Promise<string> {
    const { guid, email, role, guidInstitution } = await this.jwtService.verify(
      refreshToken,
      {
        secret: jwtConstant.refreshTokenSecret,
      },
    );

    return await this.generateAccessToken({
      guid,
      email,
      role,
      guidInstitution,
    });
  }
}
