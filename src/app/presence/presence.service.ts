import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Presence } from './schema/presence.schema';
import { ClientSession, Model } from 'mongoose';
import User from '../user/schema/user.schema';
import { Institution } from '../institution/schema/institution.schema';
import { Unit } from '../unit/schema/unit.schema';
import { IDailyPresencePayload } from 'src/utils/types/interface/IDailyPresencePayload.interface';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { Holiday } from '../scheduler/holiday/schema/holiday.schema';
import { DefaultSchedule } from '../scheduler/default-schedule/schema/defaultSchedule.schema';
import { TimezoneService } from '../timezone/timezone.service';
import {
  IExportPresence,
  IResPresence,
} from './interface/IResPresence.interface';
import { MessageService } from '../message/message.service';
import { EPresenceStatus } from 'src/utils/types/enum/EPresenceStatus.enum';
import { ExcelService } from '../excel/excel.service';
import { ChangeStatusDto } from './dto/ChangeStatus.dto';

@Injectable()
export class PresenceService {
  private logger: Logger = new Logger(PresenceService.name);

  constructor(
    @InjectModel(Presence.name)
    private presenceSchema: Model<Presence>,

    @InjectModel(User.name)
    private userSchema: Model<User>,

    @InjectModel(Institution.name)
    private institutionSchema: Model<Institution>,

    @InjectModel(Unit.name)
    private unitSchema: Model<Unit>,

    @InjectModel(Holiday.name)
    private holidaySchema: Model<Holiday>,

    @InjectModel(DefaultSchedule.name)
    private defaultScheduleSchema: Model<DefaultSchedule>,

    private timeZoneService: TimezoneService,
    private messageService: MessageService,
    private excelService: ExcelService,
  ) {}

  async createDailyDefaultPresence(): Promise<void> {
    const session: ClientSession = await this.presenceSchema.db.startSession();
    session.startTransaction();

    try {
      const dailyPresencePayload: IDailyPresencePayload[] = [];

      const institutions: Institution[] = await this.institutionSchema.find(
        {},
        {},
        { session },
      );

      if (!institutions.length) {
        this.logger.error('No institution found');
        throw new NotFoundException('No institution found');
      }

      for (const institution of institutions) {
        const holiday: Holiday = await this.holidaySchema.findOne(
          { guidInstitution: institution.guid },
          {},
          { session },
        );

        const currentDate: string = this.timeZoneService.getCurrentFullDate();

        if (holiday && holiday.date === currentDate) {
          this.logger.verbose(
            `Skipping presence creation for ${institution.name}, today is a holiday`,
          );
          continue;
        }

        const defaultSchedule: DefaultSchedule =
          await this.defaultScheduleSchema.findOne(
            { guidInstitution: institution.guid },
            {},
            { session },
          );

        if (!defaultSchedule || !defaultSchedule.daySchedule.length) {
          this.logger.verbose(
            `Skipping presence creation for ${institution.name}, no default schedule found`,
          );
          continue;
        }

        const currentDay: number = this.timeZoneService.getCurrentDay();

        const idDefaultSchedule: number[] = defaultSchedule.daySchedule.map(
          (day) => day.id,
        );

        if (!idDefaultSchedule.includes(currentDay)) {
          this.logger.verbose(
            `Skipping presence creation for ${institution.name}, today is a default holiday`,
          );
          continue;
        }

        const users: User[] = await this.userSchema.find(
          { guidInstitution: institution.guid },
          {},
          { session },
        );

        for (const user of users) {
          if (user.role !== ERole.USER) continue;

          if (!user.guidUnit) {
            this.logger.verbose(`User ${user.name} has no unit`);
            continue;
          }

          const unit: Unit = await this.unitSchema.findOne(
            {
              guid: user.guidUnit,
            },
            {},
            { session },
          );

          if (!unit) {
            this.logger.error(`Unit of user ${user.name} not found`);
            continue;
          }

          dailyPresencePayload.push({
            guidUser: user.guid,
            guidInstitution: institution.guid,
            guidUnit: unit.guid,
            createdAt: this.timeZoneService.getTimeZone(),
          });
        }
      }

      if (dailyPresencePayload.length > 0) {
        await this.presenceSchema.insertMany(dailyPresencePayload, { session });
        this.logger.verbose('Successfully created daily presence records');
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) {
        this.logger.error(
          `Error in createDailyDefaultPresence: ${error.message}`,
        );
      } else {
        this.logger.error(`Unknown error in createDailyDefaultPresence`);
      }
    } finally {
      session.endSession();
    }
  }

  getPipelineForFindAllPresence<T>(
    guidInstitution: string,
    year?: string,
    startMonth?: string,
    endMonth?: string,
    date?: string,
    guidUnit?: string,
    status?: EPresenceStatus,
    guidUser?: string,
  ): T[] {
    const pipeline = [];

    pipeline.push({ $match: { guidInstitution } });

    if (guidUser) {
      pipeline.push({ $match: { guidUser } });
    }

    if (year) {
      pipeline.push({
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      });
    }

    if (startMonth && endMonth) {
      const startDate: Date = new Date(`${startMonth}`);
      const endDate: Date = new Date(`${endMonth}`);
      endDate.setMonth(endDate.getMonth() + 1);

      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      });
    }

    if (date) {
      const startDate: Date = new Date(`${date}T00:00:00.000Z`);
      const endDate: Date = new Date(`${date}T23:59:59.999Z`);

      pipeline.push({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      });
    }

    if (guidUnit) {
      pipeline.push({ $match: { guidUnit } });
    }

    if (status) {
      pipeline.push({ $match: { status } });
    }

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'guidUser',
        foreignField: 'guid',
        as: 'user',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: 'units',
        localField: 'guidUnit',
        foreignField: 'guid',
        as: 'unit',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$unit',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: 'devices',
        localField: 'guidDevice',
        foreignField: 'mac',
        as: 'device',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$device',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: 'trxuserdevices',
        localField: 'guidDevicePresence',
        foreignField: 'guid',
        as: 'trxUserDevice',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$trxUserDevice',
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        guid: 1,
        guidUser: 1,
        identity: '$user.identity',
        name: '$user.name',
        status: 1,
        guidUnit: 1,
        unit: '$unit.name',
        macDevice: { $ifNull: ['$trxUserDevice.macDevice', null] },
        deviceLocation: { $ifNull: ['$trxUserDevice.location', null] },
        guidDevicePresence: 1,
        presenceType: 1,
        imageUrl: 1,
        description: 1,
        location: 1,
        checkIn: 1,
        checkOut: 1,
        createdAt: 1,
      },
    });

    pipeline.push({
      $sort: { createdAt: -1 },
    });

    return pipeline;
  }

  async findAllPresenceByInstitution(
    guidInstitution: string,
    year?: string,
    startMonth?: string,
    endMonth?: string,
    date?: string,
    guidUnit?: string,
    status?: EPresenceStatus,
    guidUser?: string,
  ): Promise<IResPresence[]> {
    const presences: IResPresence[] = await this.presenceSchema.aggregate(
      this.getPipelineForFindAllPresence(
        guidInstitution,
        year,
        startMonth,
        endMonth,
        date,
        guidUnit,
        status,
        guidUser,
      ),
    );

    this.messageService.setMessage('Success Find All Presence');

    return presences;
  }

  async findDetailPresence(
    guid: string,
    guidInstitution: string,
  ): Promise<IResPresence> {
    const presence: IResPresence[] = await this.presenceSchema.aggregate([
      {
        $match: {
          $and: [{ guid }, { guidInstitution }],
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
          from: 'units',
          localField: 'guidUnit',
          foreignField: 'guid',
          as: 'unit',
        },
      },
      {
        $unwind: {
          path: '$unit',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'guidDevice',
          foreignField: 'mac',
          as: 'device',
        },
      },
      {
        $unwind: {
          path: '$device',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'trxuserdevices',
          localField: 'guidDevicePresence',
          foreignField: 'guid',
          as: 'trxUserDevice',
        },
      },
      {
        $unwind: {
          path: '$trxUserDevice',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          guid: 1,
          guidUser: 1,
          identity: '$user.identity',
          name: '$user.name',
          status: 1,
          guidUnit: 1,
          unit: '$unit.name',
          macDevice: { $ifNull: ['$trxUserDevice.macDevice', null] },
          deviceLocation: { $ifNull: ['$trxUserDevice.location', null] },
          guidDevicePresence: 1,
          presenceType: 1,
          imageUrl: 1,
          description: 1,
          location: 1,
          checkIn: 1,
          checkOut: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!presence.length) throw new NotFoundException('Presence not found');

    this.messageService.setMessage('Success Find Detail Presence');
    return presence[0];
  }

  async exportAllPresence(
    guidInstitution: string,
    year?: string,
    startMonth?: string,
    endMonth?: string,
    date?: string,
    guidUnit?: string,
    status?: EPresenceStatus,
    guidUser?: string,
  ): Promise<{ filename: string; buffer: Buffer }> {
    const presences: IResPresence[] = await this.presenceSchema.aggregate(
      this.getPipelineForFindAllPresence(
        guidInstitution,
        year,
        startMonth,
        endMonth,
        date,
        guidUnit,
        status,
        guidUser,
      ),
    );

    if (!presences.length) throw new NotFoundException('Presence not found');

    const dataToFormat: IExportPresence[] = presences.map((presence) => {
      return {
        NISN: presence.identity,
        Nama: presence.name,
        Kelas: presence.unit,
        Status: presence.status,
        'Tipe Presensi': presence.presenceType,
        'Jam Masuk': presence.checkIn || '-',
        'Jam Keluar': presence.checkOut || '-',
        'Link Gambar Masuk': presence.imageUrl.imageCheckin || '-',
        'Link Gambar Pulang': presence.imageUrl.imageCheckout || '-',
        Deskripsi: presence.description || '-',
        'Latitude Checkin': presence.location.locationCheckIn.latitude || '-',
        'Longitude Checkin': presence.location.locationCheckIn.longitude || '-',
        'Latitude Checkout': presence.location.locationCheckOut.latitude || '-',
        'Longitude Checkout':
          presence.location.locationCheckOut.longitude || '-',
        tanggal: new Date(presence.createdAt).toISOString().split('T')[0],
      };
    });

    const totalPresenses: number = presences.length;
    const totalPresence: number = presences.filter(
      (presence) => presence.status === EPresenceStatus.PRESENCE,
    ).length;
    const totalSick: number = presences.filter(
      (presence) => presence.status === EPresenceStatus.SICK,
    ).length;
    const totalPermitted: number = presences.filter(
      (presence) => presence.status === EPresenceStatus.PERMITED,
    ).length;
    const totalAlpha: number = presences.filter(
      (presence) => presence.status === EPresenceStatus.ALPHA,
    ).length;

    dataToFormat.push(
      {
        NISN: 'Total Presensi',
        Nama: totalPresenses,
        Kelas: '',
        Status: '',
        'Tipe Presensi': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Link Gambar Masuk': '',
        'Link Gambar Pulang': '',
        Deskripsi: '',
        'Latitude Checkin': '',
        'Longitude Checkin': '',
        'Latitude Checkout': '',
        'Longitude Checkout': '',
        tanggal: '',
      },
      {
        NISN: 'Total Hadir',
        Nama: totalPresence,
        Kelas: '',
        Status: '',
        'Tipe Presensi': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Link Gambar Masuk': '',
        'Link Gambar Pulang': '',
        Deskripsi: '',
        'Latitude Checkin': '',
        'Longitude Checkin': '',
        'Latitude Checkout': '',
        'Longitude Checkout': '',
        tanggal: '',
      },
      {
        NISN: 'Total Sakit',
        Nama: totalSick,
        Kelas: '',
        Status: '',
        'Tipe Presensi': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Link Gambar Masuk': '',
        'Link Gambar Pulang': '',
        Deskripsi: '',
        'Latitude Checkin': '',
        'Longitude Checkin': '',
        'Latitude Checkout': '',
        'Longitude Checkout': '',
        tanggal: '',
      },
      {
        NISN: 'Total Izin',
        Nama: totalPermitted,
        Kelas: '',
        Status: '',
        'Tipe Presensi': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Link Gambar Masuk': '',
        'Link Gambar Pulang': '',
        Deskripsi: '',
        'Latitude Checkin': '',
        'Longitude Checkin': '',
        'Latitude Checkout': '',
        'Longitude Checkout': '',
        tanggal: '',
      },
      {
        NISN: 'Total Alpha',
        Nama: totalAlpha,
        Kelas: '',
        Status: '',
        'Tipe Presensi': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Link Gambar Masuk': '',
        'Link Gambar Pulang': '',
        Deskripsi: '',
        'Latitude Checkin': '',
        'Longitude Checkin': '',
        'Latitude Checkout': '',
        'Longitude Checkout': '',
        tanggal: '',
      },
    );

    const filename: string = `presence-${new Date().getTime()}`;

    const buffer: Buffer = this.excelService.exportDataToExcel(
      dataToFormat,
      filename,
    );

    return {
      filename,
      buffer,
    };
  }

  async changePresenceStatus(
    guid: string,
    guidInstitution: string,
    { status }: ChangeStatusDto,
  ): Promise<Presence> {
    const presence = await this.presenceSchema.findOne({
      guid,
      guidInstitution,
    });

    if (!presence) throw new NotFoundException('Presence not found');

    presence.status = status;

    this.messageService.setMessage('Success Change Presence Status');
    return await presence.save();
  }

  async checkingFullyPresence(): Promise<void> {
    const updatedPresence = await this.presenceSchema.updateMany(
      {
        checkIn: { $ne: null },
        checkOut: null,
        createdAt: {
          $gte: this.timeZoneService.getStartOfToday(),
          $lt: this.timeZoneService.getEndOfToday(),
        },
      },
      {
        $set: {
          status: EPresenceStatus.ALPHA,
        },
      },
    );

    if (!updatedPresence) this.logger.error('Failed to check fully presence');

    this.logger.verbose('Checking Fully Presence');
  }

  async deletePresence(guid: string, guidInstitution: string): Promise<void> {
    const presence: Presence = await this.presenceSchema.findOneAndDelete({
      guid,
      guidInstitution,
    });

    if (!presence) throw new NotFoundException('Presence not found');

    this.messageService.setMessage('Success Delete Presence');
  }
}
