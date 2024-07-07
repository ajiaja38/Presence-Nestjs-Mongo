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
import { DeviceService } from './device.service';
import { Device } from './schema/device.schema';
import { UserDec } from 'src/decorator/User.decorator';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';

@Controller('device')
@UseGuards(JwtAuthGuard, RoleGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('rfid')
  @Roles(ERole.ADMIN)
  createDeviceHandler(
    @UserDec() user: IJwtPayload,
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<Device> {
    return this.deviceService.createDeviceDto(
      user.guidInstitution,
      createDeviceDto,
      EDevice.RFID,
    );
  }

  @Get()
  @Roles(ERole.ADMIN)
  findAllDeviceByGuidInstitutionHandler(
    @UserDec() user: IJwtPayload,
  ): Promise<Device[]> {
    return this.deviceService.findAllDeviceByGuidInstitution(
      user.guidInstitution,
    );
  }

  @Get(':mac')
  @Roles(ERole.ADMIN)
  findDeviceByMac(@Param('mac') mac: string): Promise<Device> {
    return this.deviceService.findDeviceByMac(mac);
  }

  @Put('rfid/:mac')
  @Roles(ERole.ADMIN)
  updateDeviceByMac(
    @Param('mac') mac: string,
    @Body() updateDeviceDto: CreateDeviceDto,
  ): Promise<Device> {
    return this.deviceService.updateDeviceByMac(
      mac,
      updateDeviceDto,
      EDevice.RFID,
    );
  }

  @Delete(':mac')
  @Roles(ERole.ADMIN)
  deleteDeviceByMac(@Param('mac') mac: string): Promise<void> {
    return this.deviceService.deleteDeviceByMac(mac);
  }
}
