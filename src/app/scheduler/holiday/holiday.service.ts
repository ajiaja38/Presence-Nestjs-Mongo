import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Holiday } from './schema/holiday.schema';
import { Model } from 'mongoose';
import { HolidayDto } from './dto/holiday.dto';
import { MessageService } from 'src/app/message/message.service';
import { TimezoneService } from 'src/app/timezone/timezone.service';

@Injectable()
export class HolidayService {
  constructor(
    @InjectModel(Holiday.name)
    private holidaySchema: Model<Holiday>,

    private messageService: MessageService,
    private timezoneService: TimezoneService,
  ) {}

  async createHolidayDate(
    guidInstitution: string,
    { title, date }: HolidayDto,
  ): Promise<Holiday> {
    const newHoloday: Holiday = await this.holidaySchema.create({
      title,
      date,
      guidInstitution,
      createdAt: this.timezoneService.getTimeZone(),
      updatedAt: this.timezoneService.getTimeZone(),
    });

    this.messageService.setMessage('Create Holiday Successfully');

    return newHoloday;
  }

  async findAllHolidayDateByGuidInstitution(
    guidInstitution: string,
  ): Promise<Holiday[]> {
    const holidays: Holiday[] = await this.holidaySchema.find({
      guidInstitution,
    });

    this.messageService.setMessage('Get All Holiday Successfully');

    return holidays;
  }

  async findDetailHolidayByGuid(
    guid: string,
    guidInstitution: string,
  ): Promise<Holiday> {
    const holiday: Holiday = await this.holidaySchema.findOne({
      guid,
      guidInstitution,
    });

    if (!holiday) throw new NotFoundException('Holiday not found');

    this.messageService.setMessage('Get Holiday Successfully');

    return holiday;
  }

  async updateHolidayDate(
    guid: string,
    guidInstitution: string,
    { title, date }: HolidayDto,
  ): Promise<Holiday> {
    const updatedHoliday: Holiday = await this.holidaySchema.findOneAndUpdate(
      { guid, guidInstitution },
      { title, date, updatedAt: this.timezoneService.getTimeZone() },
      { new: true },
    );

    if (!updatedHoliday) throw new NotFoundException('Holiday not found');

    this.messageService.setMessage('Update Holiday Successfully');

    return updatedHoliday;
  }

  async deleteHolidayDate(
    guid: string,
    guidInstitution: string,
  ): Promise<void> {
    const deletedHolidayDate: Holiday =
      await this.holidaySchema.findOneAndDelete({ guid, guidInstitution });

    if (!deletedHolidayDate) throw new NotFoundException('Holiday not found');

    this.messageService.setMessage('Delete Holiday Successfully');
  }
}
