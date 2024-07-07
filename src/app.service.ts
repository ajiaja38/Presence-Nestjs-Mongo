import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello New LSKK Presence API! ⚡';
  }
}
