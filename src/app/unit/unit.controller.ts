import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { CreateUnitDto } from './dto/createUnit.dto';
import { Unit } from './schema/unit.schema';
import { IResAllUnit } from './interface/response.interface';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import User from '../user/schema/user.schema';
import { FastifyReply } from 'fastify';

@Controller('unit')
@UseGuards(JwtAuthGuard, RoleGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  createUnitByAdminInstitutionHandler(
    @UserDec() user: IJwtPayload,
    @Body() createUnitDto: CreateUnitDto,
  ): Promise<Unit> {
    return this.unitService.createUnit(user.guidInstitution, createUnitDto);
  }

  @Post('import-new-student')
  @UseInterceptors(FileFastifyInterceptor('file'))
  @Roles(ERole.ADMIN)
  importNewStudentHandlert(
    @UserDec() user: IJwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.unitService.addNewStudentToUnitClass(
      user.guidInstitution,
      file,
    );
  }

  @Put('import-upgrade-class')
  @UseInterceptors(FileFastifyInterceptor('file'))
  @Roles(ERole.ADMIN)
  importUpgradeClassHandler(
    @UserDec() user: IJwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.unitService.importUpgradeClass(user.guidInstitution, file);
  }

  @Get()
  @Roles(ERole.ADMIN)
  findAllUnitByInstitutionHandler(
    @UserDec() user: IJwtPayload,
  ): Promise<IResAllUnit[]> {
    return this.unitService.findAllUnitByInstitution(user.guidInstitution);
  }

  @Get(':guid')
  @Roles(ERole.SUPER_ADMIN, ERole.ADMIN)
  findUnitDetailByGuidHandler(
    @Param('guid') guid: string,
  ): Promise<IResAllUnit> {
    return this.unitService.findUnitDetailByGuid(guid);
  }

  @Get(':guid/allMember')
  @Roles(ERole.SUPER_ADMIN, ERole.ADMIN)
  findAllMemberByGuidUnitHandler(@Param('guid') guid: string): Promise<User[]> {
    return this.unitService.findAllMemberByGuidUnit(guid);
  }

  @Get(':guid/export-members')
  @Roles(ERole.SUPER_ADMIN, ERole.ADMIN)
  async exportAllMemberByGuidUnitHandler(
    @Res() res: FastifyReply,
    @Param('guid') guid: string,
  ): Promise<void> {
    const { filename, buffer } =
      await this.unitService.exportAllMemberByGuidUnit(guid);
    res.header('Content-disposition', `attachment; filename=${filename}.xlsx`);
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Put(':guid')
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  updateUnitByAdminInstitutionHandler(
    @UserDec() user: IJwtPayload,
    @Param('guid') guid: string,
    @Body() updateUnitDto: CreateUnitDto,
  ): Promise<Unit> {
    return this.unitService.updateUnit(
      guid,
      user.guidInstitution,
      updateUnitDto,
    );
  }

  @Put(':guid/activating')
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  activatingUnitByAdminInstitutionHandler(
    @Param('guid') guid: string,
  ): Promise<Unit> {
    return this.unitService.activatingUnit(guid);
  }

  @Delete(':guid')
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  deleteUnitByAdminInstitutionHandler(
    @Param('guid') guid: string,
  ): Promise<Unit> {
    return this.unitService.deleteUnit(guid);
  }
}
