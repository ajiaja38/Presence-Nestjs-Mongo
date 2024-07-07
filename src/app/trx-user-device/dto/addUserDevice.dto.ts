import { IsNotEmpty, IsString } from 'class-validator';

export class AddUserDeviceDto {
  @IsString()
  @IsNotEmpty()
  guid: string;

  @IsString()
  @IsNotEmpty()
  macDevice: string;
}
