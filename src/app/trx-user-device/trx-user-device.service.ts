import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TrxUserDevice } from './schema/trx-user-device.schema';
import { ClientSession, Model } from 'mongoose';
import { EDevice } from 'src/utils/types/enum/EDevice.enum';
import { AddUserDeviceDto } from './dto/addUserDevice.dto';
import { MessageService } from '../message/message.service';
import User from '../user/schema/user.schema';
import { IUserDevice } from './interface/response.interface';
import {
  ImetaPagination,
  IResponsePageWrapper,
} from 'src/utils/types/interface/IResPageWrapper.interface';
import { Device } from '../device/schema/device.schema';

@Injectable()
export class TrxUserDeviceService {
  constructor(
    @InjectModel(TrxUserDevice.name)
    private trxUserDeviceSchema: Model<TrxUserDevice>,

    @InjectModel(User.name)
    private userSchema: Model<User>,

    @InjectModel(Device.name)
    private deviceSchema: Model<Device>,

    private messageService: MessageService,
  ) {}

  async createUserDevice(
    guidUser: string,
    { guid, macDevice }: AddUserDeviceDto,
    deviceType: EDevice,
  ): Promise<TrxUserDevice> {
    const session: ClientSession =
      await this.trxUserDeviceSchema.db.startSession();
    session.startTransaction();

    try {
      const user: User = await this.userSchema.findOne(
        { guid: guidUser },
        {},
        { session },
      );

      if (!user) throw new NotFoundException('User not found');

      const device: Device = await this.deviceSchema.findOne(
        { mac: macDevice },
        {},
        { session },
      );

      if (!device) throw new NotFoundException('Device not found');

      const existingTrxUserDevice: TrxUserDevice =
        await this.trxUserDeviceSchema.findOne({ guid }, {}, { session });

      if (existingTrxUserDevice)
        throw new BadRequestException('Device is use by another user');

      const trxUserDevice: TrxUserDevice = await new this.trxUserDeviceSchema({
        guid,
        macDevice: device.mac,
        guidUser: user.guid,
        deviceType,
      }).save({ session });

      await session.commitTransaction();
      this.messageService.setMessage('Create User Device Successfully');
      return trxUserDevice;
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      session.endSession();
    }
  }

  async findAllTrxUserDevice(
    guidInstitution: string,
    type?: EDevice,
  ): Promise<IUserDevice[]> {
    try {
      const result: IUserDevice[] = await this.trxUserDeviceSchema.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'guidUser',
            foreignField: 'guid',
            as: 'user',
          },
        },
        {
          $match: {
            'user.guidInstitution': guidInstitution,
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'devices',
            localField: 'macDevice',
            foreignField: 'mac',
            as: 'device',
          },
        },
        {
          $unwind: {
            path: '$device',
          },
        },
        {
          $project: {
            _id: 0,
            name: '$user.name',
            guid: '$guid',
            macDevice: '$device.mac',
            locationPresence: '$device.location',
            deviceImage: '$device.deviceImage',
            type: '$deviceType',
          },
        },
      ]);

      if (type) {
        return result.filter((userDevice) => userDevice.type === type);
      }

      if (!result || result.length === 0) {
        throw new NotFoundException('No devices found');
      }

      console.log(result);

      this.messageService.setMessage('Find All User Device Successfully');
      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching user devices');
    }
  }

  async findAllTrxUserDevicePage(
    guidInstitution: string,
    page: number = 1,
    limit: number = 5,
    type?: EDevice,
  ): Promise<IResponsePageWrapper<IUserDevice>> {
    const offset: number = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'guidUser',
          foreignField: 'guid',
          as: 'user',
        },
      },
      {
        $match: {
          'user.guidInstitution': guidInstitution,
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'macDevice',
          foreignField: 'mac',
          as: 'device',
        },
      },
      {
        $unwind: {
          path: '$device',
        },
      },
      {
        $project: {
          _id: 0,
          name: '$user.name',
          guid: '$guid',
          macDevice: '$device.mac',
          locationPresence: '$device.location',
          deviceImage: '$device.deviceImage',
          type: '$deviceType',
        },
      },
    ];

    if (type) {
      pipeline.push({
        $match: {
          type: type,
        },
      });
    }

    const paginationStages: any[] = [
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ];

    const countPipeline = [
      ...pipeline,
      {
        $count: 'totalData',
      },
    ];

    const [result, countResult] = await Promise.all([
      this.trxUserDeviceSchema.aggregate([...pipeline, ...paginationStages]),
      this.trxUserDeviceSchema.aggregate(countPipeline),
    ]);

    const totalData = countResult.length > 0 ? countResult[0].totalData : 0;
    const totalPages = Math.ceil(totalData / limit);

    const meta: ImetaPagination = {
      totalPages,
      totalData,
      totalDataPerPage: result.length,
      page,
      limit,
    };

    const response: IResponsePageWrapper<IUserDevice> = {
      data: result,
      meta,
    };

    this.messageService.setMessage('Find All User Device Successfully');
    return response;
  }

  async findAllTrxUserDeviceByGuidUser(
    guidUser: string,
  ): Promise<TrxUserDevice[]> {
    this.messageService.setMessage('Find All User Device Successfully');
    return await this.trxUserDeviceSchema.find({ guidUser });
  }

  async findTrxUserDeviceByGuid(guid: string): Promise<TrxUserDevice> {
    const trxUserDevice: TrxUserDevice[] =
      await this.trxUserDeviceSchema.aggregate([
        {
          $match: {
            guid,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'guidUser',
            foreignField: 'guid',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'devices',
            localField: 'macDevice',
            foreignField: 'mac',
            as: 'device',
          },
        },
        {
          $unwind: {
            path: '$device',
          },
        },
        {
          $project: {
            _id: 0,
            name: '$user.name',
            guid: '$guid',
            macDevice: '$device.mac',
            locationPresence: '$device.location',
            deviceImage: '$device.deviceImage',
            type: '$deviceType',
          },
        },
      ]);

    if (!trxUserDevice.length)
      throw new NotFoundException('User Device not found');

    return trxUserDevice[0];
  }

  async deleteUserDeviceByGuid(guid: string): Promise<void> {
    await this.trxUserDeviceSchema.findOneAndDelete({ guid });
    this.messageService.setMessage('Delete User Device Successfully');
  }
}
