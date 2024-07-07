import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordConfService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(
    passwordPayload: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(passwordPayload, userPassword);
  }
}
