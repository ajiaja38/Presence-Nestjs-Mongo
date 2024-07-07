import { IsEnum, IsNotEmpty } from 'class-validator';
import { EPresenceStatus } from 'src/utils/types/enum/EPresenceStatus.enum';

export class ChangeStatusDto {
  @IsNotEmpty()
  @IsEnum(EPresenceStatus, { message: 'status must be a valid status' })
  status: EPresenceStatus;
}
