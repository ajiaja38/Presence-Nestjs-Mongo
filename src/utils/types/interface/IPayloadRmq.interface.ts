import { EDevice } from '../enum/EDevice.enum';

export interface IPayloadRMQ {
  id: string;
  mac?: string;
  type: EDevice;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}
