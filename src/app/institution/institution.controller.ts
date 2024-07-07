import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { Institution } from './schema/institution.schema';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { UpdateTrajectoriesDto } from './dto/update.trajectories.dto';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { IInstitutionDetail } from './interface/response.inteface';

@Controller('institution')
@UseGuards(JwtAuthGuard, RoleGuard)
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  @Roles(ERole.SUPER_ADMIN)
  getAllInstitutionHandler(): Promise<Institution[]> {
    return this.institutionService.findAllInstitution();
  }

  @Get(':id')
  @Roles(ERole.SUPER_ADMIN, ERole.ADMIN)
  getAllInstitutionByIdHandler(
    @Param('id') id: string,
  ): Promise<IInstitutionDetail> {
    return this.institutionService.findInsitutionByGuid(id);
  }

  @Put('update-trajectories')
  @Roles(ERole.ADMIN)
  updateTrajectoriesHandler(
    @UserDec() user: IJwtPayload,
    @Body() updateTrajectoriesDto: UpdateTrajectoriesDto,
  ): Promise<Institution> {
    return this.institutionService.updateTrajectories(
      user.guidInstitution,
      updateTrajectoriesDto,
    );
  }
}
