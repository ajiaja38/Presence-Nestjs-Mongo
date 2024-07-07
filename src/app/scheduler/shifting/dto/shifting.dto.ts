import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

class PresenceTimeDto {
  @IsString()
  @IsNotEmpty()
  checkInTime: string;

  @IsString()
  @IsNotEmpty()
  checkOutTime: string;

  @IsBoolean()
  @IsNotEmpty()
  nexDay: boolean;
}

export class ShiftingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  presenceTime: PresenceTimeDto;
}
