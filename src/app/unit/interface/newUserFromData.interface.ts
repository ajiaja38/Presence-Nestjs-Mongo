import { ERole } from 'src/utils/types/enum/ERole.enum';

export interface INewUserFromData {
  identity: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  profession: string;
  birthDate: string;
  password: string;
  role: ERole.USER;
  guidInstitution: string;
  guidUnit: string;
  createdAt: string;
  updatedAt: string;
}
