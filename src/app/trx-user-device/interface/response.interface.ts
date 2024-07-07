import { EDevice } from 'src/utils/types/enum/EDevice.enum';

export interface IUserDevice {
  name: string;
  guid: string;
  macDevice: string;
  locationPresence: string;
  deviceImage: string;
  type: EDevice;
}
