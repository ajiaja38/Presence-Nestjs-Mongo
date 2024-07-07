import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PresenceService } from './presence.service';
import { RoleGuard } from 'src/guard/role.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { IResPresence } from './interface/IResPresence.interface';
import { EPresenceStatus } from 'src/utils/types/enum/EPresenceStatus.enum';
import { FastifyReply } from 'fastify';
import { ChangeStatusDto } from './dto/ChangeStatus.dto';
import { Presence } from './schema/presence.schema';

@Controller('presence')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get()
  @Roles(ERole.ADMIN)
  findAllPresenceHandler(
    @UserDec() user: IJwtPayload,
    @Query('year') year: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
    @Query('date') date: string,
    @Query('guidUnit') guidUnit: string,
    @Query('status') status: EPresenceStatus,
  ): Promise<IResPresence[]> {
    return this.presenceService.findAllPresenceByInstitution(
      user.guidInstitution,
      year,
      startMonth,
      endMonth,
      date,
      guidUnit,
      status,
    );
  }

  @Get('user/:guidser')
  @Roles(ERole.ADMIN, ERole.USER)
  findAllPresenceByGuidUserHandler(
    @Param('guidser') guidser: string,
    @UserDec() user: IJwtPayload,
    @Query('year') year: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
    @Query('date') date: string,
    @Query('guidUnit') guidUnit: string,
    @Query('status') status: EPresenceStatus,
  ): Promise<IResPresence[]> {
    return this.presenceService.findAllPresenceByInstitution(
      user.guidInstitution,
      year,
      startMonth,
      endMonth,
      date,
      guidUnit,
      status,
      guidser,
    );
  }

  @Get(':guid')
  @Roles(ERole.ADMIN, ERole.USER)
  findDetailPresenceHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
  ): Promise<IResPresence> {
    return this.presenceService.findDetailPresence(guid, user.guidInstitution);
  }

  @Get('export-presence')
  @Roles(ERole.ADMIN)
  async exportAllPresenceHandler(
    @Res() res: FastifyReply,
    @UserDec() user: IJwtPayload,
    @Query('year') year: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
    @Query('date') date: string,
    @Query('guidUnit') guidUnit: string,
    @Query('status') status: EPresenceStatus,
  ): Promise<void> {
    const { buffer, filename } = await this.presenceService.exportAllPresence(
      user.guidInstitution,
      year,
      startMonth,
      endMonth,
      date,
      guidUnit,
      status,
    );
    res.header('Content-disposition', `attachment; filename=${filename}.xlsx`);
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get('export-presence/user/:guidser')
  @Roles(ERole.ADMIN)
  async exportAllPresenceByGuidUserHandler(
    @Res() res: FastifyReply,
    @UserDec() user: IJwtPayload,
    @Query('year') year: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
    @Query('date') date: string,
    @Query('guidUnit') guidUnit: string,
    @Query('status') status: EPresenceStatus,
    @Param('guidser') guidser: string,
  ): Promise<void> {
    const { buffer, filename } = await this.presenceService.exportAllPresence(
      user.guidInstitution,
      year,
      startMonth,
      endMonth,
      date,
      guidUnit,
      status,
      guidser,
    );
    res.header('Content-disposition', `attachment; filename=${filename}.xlsx`);
    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Put('update-status/:guid')
  @Roles(ERole.ADMIN)
  changePresenceStatusHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
    @Body() changeStatusDto: ChangeStatusDto,
  ): Promise<Presence> {
    return this.presenceService.changePresenceStatus(
      guid,
      user.guidInstitution,
      changeStatusDto,
    );
  }

  @Delete(':guid')
  @Roles(ERole.ADMIN)
  deletePresenceHandler(
    @Param('guid') guid: string,
    @UserDec() user: IJwtPayload,
  ): Promise<void> {
    return this.presenceService.deletePresence(guid, user.guidInstitution);
  }
}
