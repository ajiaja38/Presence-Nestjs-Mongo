import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';

export class RfidDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  mac: string;

  @IsEnum(EDevice)
  @IsString()
  @IsNotEmpty()
  type: EDevice;
}
