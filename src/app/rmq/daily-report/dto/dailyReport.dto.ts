import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';

export class DailyReportDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(EDevice)
  @IsString()
  @IsNotEmpty()
  type: EDevice;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
