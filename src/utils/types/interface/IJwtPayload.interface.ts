import { ERole } from '../enum/ERole.enum';

export interface IJwtPayload {
  guid: string;
  email: string;
  role: ERole;
  guidInstitution: string;
}
