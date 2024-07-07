import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { EDay } from 'src/utils/types/enum/EDay.enum';

class DayDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(EDay, { each: true, message: 'Invalid day' })
  @IsNotEmpty()
  day: EDay;
}

export class DefaultSchedulePresenceDto {
  @IsArray()
  @IsNotEmpty()
  days: DayDto[];
}
