import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import User from './schema/user.schema';
import { ClientSession, Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import LoginDto from '../auth/dto/login.dto';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { PasswordConfService } from './password-conf.service';
import { RegisterUserDto } from './dto/register.dto';
import { TimezoneService } from '../timezone/timezone.service';
import { MessageService } from '../message/message.service';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import {
  ImetaPagination,
  IResponsePageWrapper,
} from 'src/utils/types/interface/IResPageWrapper.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenForgotPasswordService } from '../token-forgot-password/token-forgot-password.service';
import { TokenForgotPassword } from '../token-forgot-password/schema/tokenForgotPassword.schema';
import { UpdateUserDto } from './dto/updateUser.dto';
import { InstitutionService } from '../institution/institution.service';
import { TrxUserDevice } from '../trx-user-device/schema/trx-user-device.schema';
import { Unit } from '../unit/schema/unit.schema';
import { RegisterUserByAdminDto } from './dto/registerUserByAdmin.dto';
import { ExcelService } from '../excel/excel.service';
import { IExportAllUser } from 'src/utils/types/interface/IExportAllUser.interface';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private userSchema: Model<User>,

    @InjectModel(TrxUserDevice.name)
    private trxUserDeviceSchema: Model<TrxUserDevice>,

    @InjectModel(Unit.name)
    private unitSchema: Model<Unit>,

    @Inject(CACHE_MANAGER)
    private cacheService: Cache,

    private emailService: EmailService,
    private tokenForgotPasswordService: TokenForgotPasswordService,
    private passwordConfService: PasswordConfService,
    private timezoneService: TimezoneService,
    private messageService: MessageService,
    private institutionService: InstitutionService,
    private excelService: ExcelService,
  ) {}

  async createUser(
    registerUserDto: RegisterUserDto,
    role: ERole,
  ): Promise<User> {
    const createdAt: string = this.timezoneService.getTimeZone();
    const updatedAt: string = createdAt;

    const {
      identity,
      name,
      email,
      phoneNumber,
      address,
      birthDate,
      profession,
      password,
      institutionName,
      institutionType,
      location,
      institutionGuid,
    } = registerUserDto;

    const session: ClientSession = await this.userSchema.db.startSession();
    session.startTransaction();

    try {
      let user: User;

      if (role === ERole.SUPER_ADMIN) {
        user = await new this.userSchema({
          name,
          email,
          phoneNumber,
          birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
          password: await this.passwordConfService.hashPassword(password),
          role,
          createdAt,
          updatedAt,
        }).save({ session });
      }

      if (role === ERole.ADMIN) {
        const { guid } = await this.institutionService.createInstitution(
          institutionName,
          institutionType,
          address,
          location,
          createdAt,
          updatedAt,
          session,
        );

        user = await new this.userSchema({
          name,
          email,
          phoneNumber,
          profession,
          birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
          password: await this.passwordConfService.hashPassword(password),
          address,
          role,
          createdAt,
          updatedAt,
          guidInstitution: guid,
        }).save({ session });
      }

      if (role === ERole.USER) {
        const { guid } = await this.institutionService.findInsitutionByGuid(
          institutionGuid,
          session,
        );

        const existUser: User = await this.userSchema.findOneAndUpdate(
          {
            identity,
          },
          {},
          { session },
        );

        if (existUser)
          throw new BadRequestException('User Identity already exists');

        user = await new this.userSchema({
          identity,
          name,
          email,
          phoneNumber,
          address,
          profession,
          birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
          password: await this.passwordConfService.hashPassword(password),
          role,
          createdAt,
          updatedAt,
          guidInstitution: guid,
          guidUnit: null,
        }).save({ session });
      }

      await session.commitTransaction();

      this.messageService.setMessage('Create User Successfully');
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      session.endSession();
    }
  }

  async registerUserByAdmin(
    guidInstitution: string,
    registerUserByAdminDto: RegisterUserByAdminDto,
  ): Promise<User> {
    const session: ClientSession = await this.userSchema.db.startSession();
    session.startTransaction();

    try {
      const {
        name,
        email,
        phoneNumber,
        address,
        birthDate,
        profession,
        guidUnit,
        identity,
      } = registerUserByAdminDto;

      const existingUnit: Unit = await this.unitSchema.findOne(
        { guid: guidUnit, guidInstitution },
        {},
        { session },
      );

      if (!existingUnit) throw new NotFoundException('Unit not found');

      const formatPassword: string =
        name.split(' ')[0].toLowerCase() +
        identity.split('').slice(0, 5).join('');

      const password: string =
        await this.passwordConfService.hashPassword(formatPassword);

      const newUser: User = await new this.userSchema({
        name,
        address,
        birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
        profession,
        password,
        phoneNumber,
        identity,
        email,
        role: ERole.USER,
        guidInstitution,
        guidUnit,
        createdAt: this.timezoneService.getTimeZone(),
        updatedAt: this.timezoneService.getTimeZone(),
      }).save({ session });

      if (!newUser) throw new BadRequestException('Create User Failed');

      await session.commitTransaction();
      this.messageService.setMessage('Create User Successfully');

      return newUser;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      session.endSession();
    }
  }

  async findAllUsers(role: ERole, guidInstitution?: string): Promise<User[]> {
    const cacheKey: string = 'findAllUsers';
    const cachedResult: User[] = await this.cacheService.get<User[]>(cacheKey);

    if (cachedResult) return cachedResult;

    const query: any = {
      role: ERole.USER,
    };

    if (role === ERole.ADMIN) {
      query.guidInstitution = guidInstitution;
    }

    this.messageService.setMessage('Get All Users Successfully');
    const user: User[] = await this.userSchema
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    await this.cacheService.set(cacheKey, user);
    return user;
  }

  async findAllUsersPagination(
    role: ERole,
    page: number,
    limit: number,
    search?: string,
    guidInstitution?: string,
  ): Promise<IResponsePageWrapper<User>> {
    const cacheKey: string = `findAllUsersPagination_${page}_${limit}_${search}`;

    const cachedResult: IResponsePageWrapper<User> =
      await this.cacheService.get<IResponsePageWrapper<User>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const query: any = {
      role: ERole.USER,
    };

    if (role === ERole.ADMIN) {
      query.guidInstitution = guidInstitution;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const totalData: number = await this.userSchema.countDocuments(query);
    const totalPages: number = Math.ceil(totalData / limit);
    const offset: number = (page - 1) * limit;

    const users: User[] = await this.userSchema
      .find(query)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const meta: ImetaPagination = {
      totalPages,
      totalData,
      totalDataPerPage: users.length,
      page,
      limit,
    };

    const response: IResponsePageWrapper<User> = {
      data: users,
      meta,
    };

    await this.cacheService.set(cacheKey, response);

    this.messageService.setMessage('Get All Users Successfully');
    return response;
  }

  async ExportAllUserByGuidInstitution(
    guidInstitution: string,
  ): Promise<{ filename: string; buffer: Buffer }> {
    const users: any = await this.userSchema.aggregate([
      {
        $match: {
          guidInstitution,
          role: ERole.USER,
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
        $project: {
          _id: 0,
          identity: 1,
          name: 1,
          email: 1,
          phoneNumber: 1,
          profession: 1,
          unit: '$unit.name',
          birthDate: 1,
          address: 1,
        },
      },
    ]);

    const formatedData: IExportAllUser[] = users
      .map((user: any) => ({
        NISN: user.identity,
        Nama: user.name,
        Email: user.email,
        'Nomor Telepon': user.phoneNumber,
        Unit: user.unit,
        Profesi: user.profession,
        'Tanggal Lahir': user.birthDate.toISOString().split('T')[0],
        Alamat: user.address,
      }))
      .sort((a: IExportAllUser, b: IExportAllUser) =>
        a.Unit.localeCompare(b.Unit),
      );

    const filename: string = `${guidInstitution}_User`;
    const buffer: Buffer = this.excelService.exportDataToExcel(
      formatedData,
      filename,
    );

    return {
      filename,
      buffer,
    };
  }

  async findUserByGuid(guid: string): Promise<User> {
    const cacheKey: string = `findUserByGuid_${guid}`;
    const cachedResult: User = await this.cacheService.get<User>(cacheKey);

    if (cachedResult) return cachedResult;

    const user: User = await this.userSchema.findOne({ guid });

    if (!user) throw new NotFoundException('User not found');

    await this.cacheService.set(cacheKey, user);

    this.messageService.setMessage('Get User Successfully');
    return user;
  }

  async updateUserByGuid(
    guid: string,
    { name, email, birthDate, profession, phoneNumber }: UpdateUserDto,
  ): Promise<User> {
    const user: User = await this.userSchema.findOneAndUpdate(
      { guid },
      {
        name,
        email,
        profession,
        birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
        phoneNumber,
        createdAt: this.timezoneService.getTimeZone(),
      },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');

    await this.cacheService.del(`findUserByGuid_${guid}`);
    return user;
  }

  async updatePassword(
    guid: string,
    { existingPassword, newPassword, confirmPassword }: UpdatePasswordDto,
  ): Promise<void> {
    const user: User = await this.userSchema.findOne({ guid }).exec();

    const isExistingPasswordValid =
      await this.passwordConfService.comparePassword(
        existingPassword,
        user.password,
      );

    if (!isExistingPasswordValid)
      throw new BadRequestException('Existing Password Wrong!');

    await this.updatePasswordByGuid(guid, { newPassword, confirmPassword });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const session: ClientSession = await this.userSchema.db.startSession();
    session.startTransaction();

    try {
      const { guid, name } = await this.userSchema.findOne(
        {
          email: forgotPasswordDto.email,
        },
        {},
        { session },
      );

      const token: string =
        await this.tokenForgotPasswordService.createTokenForgotPassword(
          guid,
          session,
        );

      this.emailService.sendEmailForgotPassword(
        forgotPasswordDto.email,
        name,
        token,
        session,
      );
      this.messageService.setMessage('Send Email Successfully');

      setTimeout(async () => {
        await this.tokenForgotPasswordService.deleteToken(token);
        this.logger.verbose(`Token ${token} forgot password expired`);
      }, 120000);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      session.endSession();
    }
  }

  async changeNewPasswordByToken(
    token: string,
    newPasswordDto: NewPasswordDto,
  ): Promise<void> {
    const { userGuid }: TokenForgotPassword =
      await this.tokenForgotPasswordService.findDataByToken(token);

    await this.updatePasswordByGuid(userGuid, newPasswordDto);
    this.messageService.setMessage('Change new Password Successfully');
  }

  async updatePasswordByGuid(
    guid: string,
    { newPassword, confirmPassword }: NewPasswordDto,
  ): Promise<void> {
    if (newPassword !== confirmPassword)
      throw new BadRequestException(
        'New Password and Confirm Password Not Match!',
      );

    await this.userSchema.findOneAndUpdate(
      { guid },
      {
        password: await this.passwordConfService.hashPassword(newPassword),
        updatedAt: this.timezoneService.getTimeZone(),
      },
      { new: true },
    );

    this.messageService.setMessage('Update Password Successfully');
  }

  async updateUserUnitByGuid(guid: string, guidUnit: string): Promise<User> {
    const session: ClientSession = await this.userSchema.db.startSession();
    session.startTransaction();

    try {
      const existingUnit: Unit = await this.unitSchema.findOne(
        { guid: guidUnit },
        {},
        { session },
      );

      if (!existingUnit) throw new NotFoundException('Unit not found');

      const updatedUser: User = await this.userSchema.findOneAndUpdate(
        { guid },
        {
          guidUnit,
          updatedAt: this.timezoneService.getTimeZone(),
        },
        { new: true, session },
      );

      if (!updatedUser) throw new NotFoundException('User not found');

      await session.commitTransaction();
      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  async deleteUser(guid: string): Promise<void> {
    const session: ClientSession = await this.userSchema.db.startSession();
    session.startTransaction();

    try {
      const deletedUser: User = await this.userSchema.findOneAndDelete(
        {
          guid,
        },
        { session },
      );

      if (!deletedUser) throw new NotFoundException('User Not Found');

      await this.trxUserDeviceSchema.deleteMany(
        { guidUser: deletedUser.guid },
        { session },
      );

      this.messageService.setMessage('Delete User Successfully');

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      session.endSession();
    }
  }

  async validateCredentials(loginDto: LoginDto): Promise<IJwtPayload> {
    const { email, password } = loginDto;

    const user: User = await this.userSchema.findOne({ email });

    if (!user) throw new NotFoundException('User Not Found');

    const isPasswordValid: boolean =
      await this.passwordConfService.comparePassword(password, user.password);

    if (!isPasswordValid) throw new BadRequestException('Password Wrong!');

    const { guid, role, guidInstitution }: User = await this.findUserByGuid(
      user.guid,
    );

    return {
      guid,
      email,
      role,
      guidInstitution,
    };
  }
}
