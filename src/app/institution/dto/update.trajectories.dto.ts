import { IsArray } from 'class-validator';
import { ILocation } from 'src/utils/types/interface/ILocation.interface';

export class UpdateTrajectoriesDto {
  @IsArray()
  trajectories: ILocation[];
}
