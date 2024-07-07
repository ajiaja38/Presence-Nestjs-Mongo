import { SetMetadata } from '@nestjs/common';
import { ERole } from 'src/utils/types/enum/ERole.enum';

export const Roles = (...roles: ERole[]) => SetMetadata('roles', roles);
