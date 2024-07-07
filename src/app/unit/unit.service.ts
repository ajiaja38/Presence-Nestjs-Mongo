import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Unit } from './schema/unit.schema';
import { ClientSession, Model } from 'mongoose';
import { TimezoneService } from '../timezone/timezone.service';
import { MessageService } from '../message/message.service';
import { Institution } from '../institution/schema/institution.schema';
import { CreateUnitDto } from './dto/createUnit.dto';
import { IResAllUnit } from './interface/response.interface';
import { ExcelService } from '../excel/excel.service';
import User from '../user/schema/user.schema';
import { INewStudentToUnit } from './interface/excelFile.interface';
import { INewUserFromData } from './interface/newUserFromData.interface';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { PasswordConfService } from '../user/password-conf.service';
import { Shifting } from '../scheduler/shifting/schema/shifting.schema';

@Injectable()
export class UnitService {
  constructor(
    @InjectModel(Unit.name)
    private unitSchema: Model<Unit>,

    @InjectModel(Institution.name)
    private institutionSchema: Model<Institution>,

    @InjectModel(User.name)
    private userSchema: Model<User>,

    @InjectModel(Shifting.name)
    private shiftingSchema: Model<Shifting>,

    private timeZoneService: TimezoneService,
    private messageService: MessageService,
    private excelService: ExcelService,
    private passwordConfService: PasswordConfService,
  ) {}

  async createUnit(
    guidInstitution: string,
    { name, guidShifting }: CreateUnitDto,
  ): Promise<Unit> {
    const session: ClientSession = await this.unitSchema.db.startSession();
    session.startTransaction();

    try {
      const existingInstitution: Institution =
        await this.institutionSchema.findOne(
          { guid: guidInstitution },
          {},
          { session },
        );

      if (!existingInstitution)
        throw new NotFoundException('Institution not found');

      const existingShifting: Shifting = await this.shiftingSchema.findOne(
        { guid: guidShifting, guidInstitution: existingInstitution.guid },
        {},
        { session },
      );

      if (!existingShifting) throw new NotFoundException('Shifting not found');

      this.messageService.setMessage('Success Create Unit');

      const unit: Unit = await new this.unitSchema({
        name,
        guidShift: existingShifting.guid,
        guidInstitution,
        createdAt: this.timeZoneService.getTimeZone(),
        updatedAt: this.timeZoneService.getTimeZone(),
      }).save({ session });

      await session.commitTransaction();

      return unit;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error: ${error}`);
    } finally {
      session.endSession();
    }
  }

  async addNewStudentToUnitClass(
    guidInstitution: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const session: ClientSession = await this.unitSchema.db.startSession();
    session.startTransaction();

    try {
      const datas: INewStudentToUnit[] =
        await this.excelService.importDataFromExcel(file);

      const newStudent: INewUserFromData[] = [];

      for (const data of datas) {
        const existingUnit: Unit = await this.unitSchema.findOne(
          {
            name: data.Kelas,
            guidInstitution,
          },
          {},
          { session },
        );

        if (!existingUnit) throw new NotFoundException('Unit Not Found');

        const formatPassword: string =
          data.Nama.split(' ')[0].toLowerCase() +
          data.NISN.split('').slice(0, 5).join('');

        const password: string =
          await this.passwordConfService.hashPassword(formatPassword);

        newStudent.push({
          identity: data.NISN,
          name: data.Nama,
          email: data.Email,
          phoneNumber: data.NomorTelepon,
          address: data.Alamat,
          profession: 'student',
          birthDate: data.TanggalLahir,
          password,
          role: ERole.USER,
          guidInstitution,
          guidUnit: existingUnit.guid,
          createdAt: this.timeZoneService.getTimeZone(),
          updatedAt: this.timeZoneService.getTimeZone(),
        });
      }

      await this.userSchema.insertMany(newStudent, { session });
      this.messageService.setMessage(
        `Success import ${newStudent.length} student To each class`,
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    } finally {
      session.endSession();
    }
  }

  async importUpgradeClass(
    guidInstitution: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const session: ClientSession = await this.unitSchema.db.startSession();
    session.startTransaction();

    try {
      const datas: INewStudentToUnit[] =
        await this.excelService.importDataFromExcel(file);

      for (const data of datas) {
        const existingUnit: Unit = await this.unitSchema.findOne(
          {
            name: data.Kelas,
            guidInstitution,
          },
          {},
          { session },
        );

        if (!existingUnit) throw new NotFoundException('Unit Not Found');

        const updatedUser: User = await this.userSchema.findOneAndUpdate(
          {
            identity: data.NISN,
            guidInstitution,
          },
          {
            name: data.Nama,
            email: data.Email,
            guidUnit: existingUnit.guid,
            phoneNumber: data.NomorTelepon,
            birthDate: data.TanggalLahir,
            address: data.Alamat,
            updatedAt: this.timeZoneService.getTimeZone(),
          },
          { new: true, session },
        );

        if (!updatedUser) throw new NotFoundException('User Not Found');
      }

      this.messageService.setMessage(
        'Success import upgrade student To each class',
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    } finally {
      session.endSession();
    }
  }

  async findAllUnitByInstitution(
    guidInstitution: string,
  ): Promise<IResAllUnit[]> {
    const units: IResAllUnit[] = await this.unitSchema.aggregate([
      {
        $match: { guidInstitution, isDeleted: false },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'guid',
          foreignField: 'guidUnit',
          as: 'member',
        },
      },
      {
        $project: {
          _id: 0,
          guid: 1,
          name: 1,
          createdAt: 1,
          updatedAt: 1,
          totalMember: { $size: '$member' },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    this.messageService.setMessage('Success Get All Unit');

    return units;
  }

  async findUnitDetailByGuid(guid: string): Promise<IResAllUnit> {
    const unit: IResAllUnit[] = await this.unitSchema.aggregate([
      {
        $match: { guid, isDeleted: false },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'guid',
          foreignField: 'guidUnit',
          as: 'member',
        },
      },
      {
        $project: {
          _id: 0,
          guid: 1,
          name: 1,
          createdAt: 1,
          updatedAt: 1,
          totalMember: { $size: '$member' },
        },
      },
    ]);

    this.messageService.setMessage('Success Get Detail Unit');
    if (!unit.length) throw new NotFoundException('Unit not found');

    return unit[0];
  }

  async findAllMemberByGuidUnit(guidUnit: string): Promise<User[]> {
    await this.findUnitDetailByGuid(guidUnit);

    const users: User[] = await this.userSchema.find({ guidUnit }).sort({
      name: 1,
    });

    this.messageService.setMessage('Success Get All Member By Unit');
    return users;
  }

  async exportAllMemberByGuidUnit(
    guidUnit: string,
  ): Promise<{ filename: string; buffer: Buffer }> {
    const { name } = await this.findUnitDetailByGuid(guidUnit);

    const users: User[] = await this.userSchema.find({ guidUnit }).sort({
      name: 1,
    });

    const dataToFormat: INewStudentToUnit[] = users.map((user) => {
      return {
        NISN: user.identity,
        Nama: user.name,
        Email: user.email,
        Kelas: name,
        NomorTelepon: user.phoneNumber,
        Alamat: user.address,
        TanggalLahir: user.birthDate.toISOString().split('T')[0],
      };
    });

    const filename: string = `${name}_Member.xlsx`;

    const buffer: Buffer = this.excelService.exportDataToExcel(
      dataToFormat,
      filename,
    );

    return { filename, buffer };
  }

  async updateUnit(
    guid: string,
    guidInstitution: string,
    { name }: CreateUnitDto,
  ): Promise<Unit> {
    const session: ClientSession = await this.unitSchema.db.startSession();
    session.startTransaction();

    try {
      const existingInstitution = await this.institutionSchema.findOne(
        { guid: guidInstitution },
        {},
        { session },
      );

      if (!existingInstitution)
        throw new NotFoundException('Institution not found');

      const updatedUnit: Unit = await this.unitSchema.findOneAndUpdate(
        { guid },
        {
          name,
          updatedAt: this.timeZoneService.getTimeZone(),
        },
        { new: true, session },
      );

      if (!updatedUnit) throw new NotFoundException('Unit not found');

      this.messageService.setMessage('Success Update Unit');

      await session.commitTransaction();
      return updatedUnit;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error: ${error}`);
    } finally {
      session.endSession();
    }
  }

  async activatingUnit(guid: string): Promise<Unit> {
    const deletedUnit: Unit = await this.unitSchema.findOneAndUpdate(
      { guid },
      { isDeleted: false, updatedAt: this.timeZoneService.getTimeZone() },
      { new: true },
    );

    this.messageService.setMessage('Success Activating Unit');
    return deletedUnit;
  }

  async deleteUnit(guid: string): Promise<Unit> {
    const deletedUnit: Unit = await this.unitSchema.findOneAndUpdate(
      { guid },
      { isDeleted: true, updatedAt: this.timeZoneService.getTimeZone() },
      { new: true },
    );

    this.messageService.setMessage('Success Soft Delete Unit');
    return deletedUnit;
  }
}
