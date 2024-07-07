import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { HolidayDto } from './dto/holiday.dto';
import { Holiday } from './schema/holiday.schema';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';

@Controller('holiday')
@UseGuards(JwtAuthGuard, RoleGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @Roles(ERole.ADMIN)
  createHolidayDateHandler(
    @UserDec() user: IJwtPayload,
    @Body() holidayDto: HolidayDto,
  ): Promise<Holiday> {
    return this.holidayService.createHolidayDate(
      user.guidInstitution,
      holidayDto,
    );
  }

  @Get()
  @Roles(ERole.ADMIN, ERole.USER)
  findAllHolidayDateByGuidInstitutionHandler(
    @UserDec() user: IJwtPayload,
  ): Promise<Holiday[]> {
    return this.holidayService.findAllHolidayDateByGuidInstitution(
      user.guidInstitution,
    );
  }

  @Get(':guid')
  @Roles(ERole.ADMIN, ERole.USER)
  findDetailHolidayByGuidHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
  ): Promise<Holiday> {
    return this.holidayService.findDetailHolidayByGuid(
      guid,
      user.guidInstitution,
    );
  }

  @Put(':guid')
  @Roles(ERole.ADMIN)
  updateHolidayDateHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
    @Body() holidayDto: HolidayDto,
  ): Promise<Holiday> {
    return this.holidayService.updateHolidayDate(
      guid,
      user.guidInstitution,
      holidayDto,
    );
  }

  @Delete(':guid')
  @Roles(ERole.ADMIN)
  deleteHolidayDateHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
  ): Promise<void> {
    return this.holidayService.deleteHolidayDate(guid, user.guidInstitution);
  }
}
