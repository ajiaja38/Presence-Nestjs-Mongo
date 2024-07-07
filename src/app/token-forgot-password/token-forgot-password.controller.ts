import { Controller } from '@nestjs/common';
import { TokenForgotPasswordService } from './token-forgot-password.service';

@Controller('token-forgot-password')
export class TokenForgotPasswordController {
  constructor(
    private readonly tokenForgotPasswordService: TokenForgotPasswordService,
  ) {}
}
