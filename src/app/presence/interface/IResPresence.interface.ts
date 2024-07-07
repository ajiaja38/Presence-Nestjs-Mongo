import { EDevice } from 'src/utils/types/enum/EDevice.enum';
import { EPresenceStatus } from 'src/utils/types/enum/EPresenceStatus.enum';
import { IImageUrl } from 'src/utils/types/interface/IImageUrl.interface';
import { ILocationPresence } from 'src/utils/types/interface/ILocation.interface';

export interface IResPresence {
  guid: string;
  guidUser: string;
  identity: string;
  name: string;
  status: EPresenceStatus;
  guidUnit: string;
  unit: string;
  macDevice: string | null;
  deviceLocation: string | null;
  guidDevicePresence: string | null;
  presenceType: EDevice;
  imageUrl: IImageUrl;
  description: string | null;
  location: ILocationPresence;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
}

export interface IResAllPresence {
  presences: IResPresence[];
  totalPresence: number;
  totalAlpha: number;
  totalSick: number;
  totalPermitted: number;
}

export interface IExportPresence {
  NISN: string;
  Nama: string | number;
  Kelas: string;
  Status: EPresenceStatus | string;
  'Tipe Presensi': EDevice | string;
  'Jam Masuk': string;
  'Jam Keluar': string;
  'Link Gambar Masuk': string;
  'Link Gambar Pulang': string;
  Deskripsi: string;
  'Latitude Checkin': number | string;
  'Longitude Checkin': number | string;
  'Latitude Checkout': number | string;
  'Longitude Checkout': number | string;
  tanggal: string;
}
