import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Institution } from './schema/institution.schema';
import { ClientSession, Model } from 'mongoose';
import { ILocation } from 'src/utils/types/interface/ILocation.interface';
import { randomBytes } from 'crypto';
import { EInstitution } from 'src/utils/types/enum/EInstitution.enum';
import { UpdateTrajectoriesDto } from './dto/update.trajectories.dto';
import { MessageService } from '../message/message.service';
import { TimezoneService } from '../timezone/timezone.service';
import { IInstitutionDetail } from './interface/response.inteface';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectModel(Institution.name)
    private readonly institutionSchema: Model<Institution>,

    private readonly messageService: MessageService,
    private readonly timeZoneService: TimezoneService,
  ) {}

  async createInstitution(
    name: string,
    type: EInstitution,
    address: string,
    location: ILocation,
    createdAt: string,
    updatedAt: string,
    session?: ClientSession,
  ): Promise<Institution> {
    const guidLength: number = 4;
    const guidPattern: string = randomBytes(Math.ceil(guidLength / 2))
      .toString('hex')
      .slice(0, guidLength);

    const institution: Institution = await new this.institutionSchema({
      guid:
        type === EInstitution.COMPANY ? `CM${guidPattern}` : `SC${guidPattern}`,
      name,
      type,
      address,
      location,
      createdAt,
      updatedAt,
    }).save({ session });

    return institution;
  }

  async findAllInstitution(): Promise<Institution[]> {
    this.messageService.setMessage('Success Find All Institution');
    return await this.institutionSchema.find().sort({ createdAt: -1 });
  }

  async findInsitutionByGuid(
    guid: string,
    session?: ClientSession,
  ): Promise<IInstitutionDetail> {
    const institution: IInstitutionDetail[] = await this.institutionSchema
      .aggregate<IInstitutionDetail>([
        {
          $match: {
            guid,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'guid',
            foreignField: 'guidInstitution',
            as: 'users',
          },
        },
        {
          $lookup: {
            from: 'devices',
            localField: 'guid',
            foreignField: 'guidInstitution',
            as: 'devices',
          },
        },
        {
          $lookup: {
            from: 'units',
            localField: 'guid',
            foreignField: 'guidInstitution',
            as: 'units',
          },
        },
        {
          $lookup: {
            from: 'defaultschedules',
            localField: 'guid',
            foreignField: 'guidInstitution',
            as: 'defaultschedules',
          },
        },
        {
          $addFields: {
            users: {
              $filter: {
                input: '$users',
                as: 'user',
                cond: { $eq: ['$$user.role', 'user'] },
              },
            },
          },
        },
        {
          $unwind: {
            path: '$defaultschedules',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'shiftings',
            localField: 'guid',
            foreignField: 'guidInstitution',
            as: 'shiftings',
          },
        },
        {
          $project: {
            _id: 0,
            guid: 1,
            name: 1,
            type: 1,
            address: 1,
            location: 1,
            trajectory: 1,
            daySchedule: '$defaultschedules.daySchedule',
            shiftings: '$shiftings',
            schedulePresence: '$defaultschedules.schedulePresence',
            createdAt: 1,
            updatedAt: 1,
            totalUnit: { $size: '$units' },
            totalMember: { $size: '$users' },
            totalDevice: { $size: '$devices' },
          },
        },
      ])
      .session(session);

    if (!institution.length) {
      throw new NotFoundException('Institution not found');
    }

    this.messageService.setMessage('Success Find Detail Institution');

    return institution[0];
  }

  async updateTrajectories(
    guid: string,
    { trajectories }: UpdateTrajectoriesDto,
  ): Promise<Institution> {
    const institution: Institution =
      await this.institutionSchema.findOneAndUpdate(
        { guid },
        {
          trajectory: trajectories,
          updatedAt: this.timeZoneService.getTimeZone(),
        },
        { new: true },
      );

    if (!institution) throw new NotFoundException('Institution not found');

    this.messageService.setMessage('Success Update Trajectory');

    return institution;
  }
}
