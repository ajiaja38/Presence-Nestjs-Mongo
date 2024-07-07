import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';

export const UserDec = createParamDecorator(
  (data: unknown, context: ExecutionContext): IJwtPayload => {
    const req = context.switchToHttp().getRequest();
    return req.user as IJwtPayload;
  },
);
