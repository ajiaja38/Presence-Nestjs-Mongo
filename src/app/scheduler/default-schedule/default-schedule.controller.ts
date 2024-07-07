import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DefaultScheduleService } from './default-schedule.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { DefaultSchedulePresenceDto } from './dto/defaulstSchedulePresence.dto';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { DefaultSchedule } from './schema/defaultSchedule.schema';

@Controller('default-schedule')
@UseGuards(JwtAuthGuard, RoleGuard)
export class DefaultScheduleController {
  constructor(
    private readonly defaultScheduleService: DefaultScheduleService,
  ) {}

  @Post()
  @Roles(ERole.ADMIN)
  createDefaulstSchedule(
    @UserDec() user: IJwtPayload,
    @Body() defaultSchedulePresenceDto: DefaultSchedulePresenceDto,
  ): Promise<DefaultSchedule> {
    return this.defaultScheduleService.createDefaultSchedule(
      user.guidInstitution,
      defaultSchedulePresenceDto,
    );
  }

  @Get('all')
  @Roles(ERole.SUPER_ADMIN)
  findAllDefaultScheduleBySuperAdmin(): Promise<DefaultSchedule[]> {
    return this.defaultScheduleService.findAllDefaultScheduleBySuperAdmin();
  }

  @Get()
  @Roles(ERole.ADMIN, ERole.USER)
  findDefaultScheduleByGuidInstitution(
    @UserDec() user: IJwtPayload,
  ): Promise<DefaultSchedule> {
    return this.defaultScheduleService.findDefaultScheduleByGuidInstitution(
      user.guidInstitution,
    );
  }

  @Put()
  @Roles(ERole.ADMIN)
  updateDefaultScheduleByGuidInstitution(
    @UserDec() user: IJwtPayload,
    @Body() defaultSchedulePresenceDto: DefaultSchedulePresenceDto,
  ): Promise<DefaultSchedule> {
    return this.defaultScheduleService.updateDefaultScheduleByGuidInstitution(
      user.guidInstitution,
      defaultSchedulePresenceDto,
    );
  }

  @Delete()
  @Roles(ERole.ADMIN)
  deleteDefaultScheduleByGuidInstitution(
    @UserDec() user: IJwtPayload,
  ): Promise<void> {
    return this.defaultScheduleService.deleteDefaultScheduleByGuidInstitution(
      user.guidInstitution,
    );
  }
}
