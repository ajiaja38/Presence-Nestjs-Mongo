import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './schema/device.schema';
import { ClientSession, Model } from 'mongoose';
import { TimezoneService } from '../timezone/timezone.service';
import { MessageService } from '../message/message.service';
import { CreateDeviceDto } from './dto/createDevice.dto';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';
import { TrxUserDevice } from '../trx-user-device/schema/trx-user-device.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private deviceSchema: Model<Device>,

    @InjectModel(Device.name)
    private trxUserDeviceSchema: Model<TrxUserDevice>,

    private timeZoneService: TimezoneService,
    private messageService: MessageService,
  ) {}

  async createDeviceDto(
    guidInstitution: string,
    createDeviceDto: CreateDeviceDto,
    type: EDevice,
  ): Promise<Device> {
    const { mac, location, deviceImage, status } = createDeviceDto;

    const createDevice: Device = await this.deviceSchema.create({
      mac,
      location,
      deviceImage,
      guidInstitution,
      status,
      type,
      createdAt: this.timeZoneService.getTimeZone(),
      updatedAt: this.timeZoneService.getTimeZone(),
    });

    this.messageService.setMessage('Create Device Successfully');

    return createDevice;
  }

  async findAllDeviceByGuidInstitution(
    guidInstitution: string,
  ): Promise<Device[]> {
    this.messageService.setMessage('Find All Device Successfully');
    return await this.deviceSchema.find({ guidInstitution });
  }

  async findDeviceByMac(mac: string): Promise<Device> {
    const device: Device = await this.deviceSchema.findOne({ mac });
    if (!device) throw new NotFoundException('Device not found');

    this.messageService.setMessage('Find Device Successfully');

    return device;
  }

  async updateDeviceByMac(
    mac: string,
    updateDeviceDto: CreateDeviceDto,
    type: EDevice,
  ): Promise<Device> {
    const { location, deviceImage, status } = updateDeviceDto;

    const updatedDevice: Device = await this.deviceSchema.findOneAndUpdate(
      { mac },
      {
        location,
        deviceImage,
        status,
        type,
        updatedAt: this.timeZoneService.getTimeZone(),
      },
      { new: true },
    );

    if (!updatedDevice) throw new NotFoundException('Device not found');

    this.messageService.setMessage('Update Device Successfully');

    return updatedDevice;
  }

  async deleteDeviceByMac(mac: string): Promise<void> {
    const session: ClientSession = await this.deviceSchema.db.startSession();
    session.startTransaction();

    try {
      const deletedDevice: Device = await this.deviceSchema.findOneAndDelete(
        {
          mac,
        },
        { session },
      );

      const trxUserDevice: TrxUserDevice[] =
        await this.trxUserDeviceSchema.find(
          {
            macDevice: mac,
          },
          {},
          { session },
        );

      if (trxUserDevice)
        throw new NotFoundException('Device is use by another user');

      if (!deletedDevice) throw new NotFoundException('Device not found');

      await session.commitTransaction();
      this.messageService.setMessage('Delete Device Successfully');
    } catch (error) {
      await session.abortTransaction();
      throw new NotFoundException(error.message);
    } finally {
      session.endSession();
    }
  }
}
