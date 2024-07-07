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
import { ShiftingService } from './shifting.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { ShiftingDto } from './dto/shifting.dto';
import { Shifting } from './schema/shifting.schema';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';

@Controller('shifting')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ShiftingController {
  constructor(private readonly shiftingService: ShiftingService) {}

  @Post()
  @Roles(ERole.ADMIN)
  createShifting(
    @UserDec() user: IJwtPayload,
    @Body() shiftingDto: ShiftingDto,
  ): Promise<Shifting> {
    return this.shiftingService.createShifting(
      user.guidInstitution,
      shiftingDto,
    );
  }

  @Get()
  @Roles(ERole.ADMIN, ERole.USER)
  getAllShifting(@UserDec() user: IJwtPayload): Promise<Shifting[]> {
    return this.shiftingService.getAllShiftingByGuidInstitution(
      user.guidInstitution,
    );
  }

  @Get(':guid')
  @Roles(ERole.ADMIN, ERole.USER)
  getShifting(@Param('guid') guid: string): Promise<Shifting> {
    return this.shiftingService.getShiftingByGuid(guid);
  }

  @Put(':guid')
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  updateShifting(
    @Param('guid') guid: string,
    @Body() shiftingDto: ShiftingDto,
  ): Promise<Shifting> {
    return this.shiftingService.updateShiftingByGuid(guid, shiftingDto);
  }

  @Delete(':guid')
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  deleteShifting(@Param('guid') guid: string): Promise<void> {
    return this.shiftingService.deleteShiftingByGuid(guid);
  }
}
