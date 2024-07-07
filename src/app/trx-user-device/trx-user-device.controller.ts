import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrxUserDeviceService } from './trx-user-device.service';
import { AddUserDeviceDto } from './dto/addUserDevice.dto';
import { TrxUserDevice } from './schema/trx-user-device.schema';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { IUserDevice } from './interface/response.interface';
import { IResponsePageWrapper } from 'src/utils/types/interface/IResPageWrapper.interface';

@Controller('trx-user-device')
@UseGuards(JwtAuthGuard)
export class TrxUserDeviceController {
  constructor(private readonly trxUserDeviceService: TrxUserDeviceService) {}

  @Post('rfid')
  addUserRfidHandler(
    @Body() addUserDeviceDto: AddUserDeviceDto,
    @UserDec() user: IJwtPayload,
  ): Promise<TrxUserDevice> {
    return this.trxUserDeviceService.createUserDevice(
      user.guid,
      addUserDeviceDto,
      EDevice.RFID,
    );
  }

  @Put('rfid/:guid')
  @UseGuards(RoleGuard)
  @Roles(ERole.ADMIN)
  addUserRfidByAdminHandler(
    @Param('guid') guid: string,
    @Body() addUserDeviceDto: AddUserDeviceDto,
  ): Promise<TrxUserDevice> {
    return this.trxUserDeviceService.createUserDevice(
      guid,
      addUserDeviceDto,
      EDevice.RFID,
    );
  }

  @Get()
  getAllUserDeviceByAuthorityHandler(
    @UserDec() user: IJwtPayload,
  ): Promise<TrxUserDevice[]> {
    return this.trxUserDeviceService.findAllTrxUserDeviceByGuidUser(user.guid);
  }

  @Get(':id')
  getUserDeviceByGuidHandler(
    @Param('id') guid: string,
  ): Promise<TrxUserDevice> {
    return this.trxUserDeviceService.findTrxUserDeviceByGuid(guid);
  }

  @Get('all-devices')
  getAllUserDeviceByAdminHandler(
    @UserDec() user: IJwtPayload,
    @Query('type') type: EDevice,
  ): Promise<IUserDevice[]> {
    return this.trxUserDeviceService.findAllTrxUserDevice(
      user.guidInstitution,
      type,
    );
  }

  @Get('all-devices/page')
  getAllUserDeviceByAdminPaginationHandler(
    @UserDec() user: IJwtPayload,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('type') type: EDevice,
  ): Promise<IResponsePageWrapper<IUserDevice>> {
    return this.trxUserDeviceService.findAllTrxUserDevicePage(
      user.guidInstitution,
      page,
      limit,
      type,
    );
  }

  @Delete(':id')
  deleteUserDeviceByGuidHandler(@Param('id') guid: string): Promise<void> {
    return this.trxUserDeviceService.deleteUserDeviceByGuid(guid);
  }
}
