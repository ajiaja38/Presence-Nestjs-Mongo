import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DefaultSchedule } from './schema/defaultSchedule.schema';
import { Model } from 'mongoose';
import { DefaultSchedulePresenceDto } from './dto/defaulstSchedulePresence.dto';
import { MessageService } from 'src/app/message/message.service';
import { TimezoneService } from 'src/app/timezone/timezone.service';

@Injectable()
export class DefaultScheduleService {
  constructor(
    @InjectModel(DefaultSchedule.name)
    private defaultScheduleSchema: Model<DefaultSchedule>,

    private messageService: MessageService,
    private timezoneService: TimezoneService,
  ) {}

  async createDefaultSchedule(
    guidInstitution: string,
    defaultSchedulePresenceDto: DefaultSchedulePresenceDto,
  ): Promise<DefaultSchedule> {
    const { days } = defaultSchedulePresenceDto;

    const existingSchedule: DefaultSchedule =
      await this.defaultScheduleSchema.findOne({ guidInstitution });

    if (existingSchedule) {
      throw new BadRequestException('Default Schedule Already Exists');
    }

    const createdAt: string = this.timezoneService.getTimeZone();
    const updatedAt: string = createdAt;

    const createDefaultSchedule: DefaultSchedule =
      await this.defaultScheduleSchema.create({
        guidInstitution,
        daySchedule: days,
        createdAt,
        updatedAt,
      });

    if (!createDefaultSchedule)
      throw new BadRequestException('Bad Request, Invalid Data input');

    this.messageService.setMessage('Create Default Schedule Successfully');

    return createDefaultSchedule;
  }

  async findAllDefaultScheduleBySuperAdmin(): Promise<DefaultSchedule[]> {
    this.messageService.setMessage('Success Find All Default Schedule');
    return await this.defaultScheduleSchema.find().sort({ createdAt: -1 });
  }

  async findDefaultScheduleByGuidInstitution(
    guidInstitution: string,
  ): Promise<DefaultSchedule> {
    const defaultSchedule: DefaultSchedule =
      await this.defaultScheduleSchema.findOne({ guidInstitution });

    if (!defaultSchedule)
      throw new NotFoundException('Default Schedule Not Found');

    this.messageService.setMessage('Success Find Default Schedule');
    return defaultSchedule;
  }

  async updateDefaultScheduleByGuidInstitution(
    guidInstitution: string,
    defaultSchedulePresenceDto: DefaultSchedulePresenceDto,
  ): Promise<DefaultSchedule> {
    const { days } = defaultSchedulePresenceDto;
    const updatedAt: string = this.timezoneService.getTimeZone();
    const updateDefaultSchedule: DefaultSchedule =
      await this.defaultScheduleSchema.findOneAndUpdate(
        { guidInstitution },
        {
          daySchedule: days,
          updatedAt,
        },
        { new: true },
      );

    if (!updateDefaultSchedule)
      throw new NotFoundException('Default Schedule Not Found');

    this.messageService.setMessage('Update Default Schedule Successfully');
    return updateDefaultSchedule;
  }

  async deleteDefaultScheduleByGuidInstitution(
    guidInstitution: string,
  ): Promise<void> {
    const deletedDefaultSchedule: DefaultSchedule =
      await this.defaultScheduleSchema.findOneAndDelete({ guidInstitution });

    if (!deletedDefaultSchedule)
      throw new NotFoundException('Default Schedule Not Found');
    this.messageService.setMessage('Delete Default Schedule Successfully');
  }
}
