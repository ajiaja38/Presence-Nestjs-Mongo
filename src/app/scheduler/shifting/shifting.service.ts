import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Shifting } from './schema/shifting.schema';
import { ClientSession, Model } from 'mongoose';
import { ShiftingDto } from './dto/shifting.dto';
import { MessageService } from 'src/app/message/message.service';
import { TimezoneService } from 'src/app/timezone/timezone.service';
import { Institution } from 'src/app/institution/schema/institution.schema';
import { Unit } from 'src/app/unit/schema/unit.schema';

@Injectable()
export class ShiftingService {
  constructor(
    @InjectModel(Shifting.name)
    private shiftingSchema: Model<Shifting>,

    @InjectModel(Institution.name)
    private institutionSchema: Model<Institution>,

    @InjectModel(Unit.name)
    private unitSchema: Model<Unit>,

    private messageService: MessageService,
    private timezoneService: TimezoneService,
  ) {}

  async createShifting(
    guid: string,
    shiftingDto: ShiftingDto,
  ): Promise<Shifting> {
    const session: ClientSession = await this.shiftingSchema.db.startSession();
    session.startTransaction();

    try {
      const institution: Institution = await this.institutionSchema.findOne(
        { guid },
        {},
        { session },
      );

      if (!institution) throw new NotFoundException('Institution Not Found');

      const newShifting: Shifting = await new this.shiftingSchema({
        guidInstitution: institution.guid,
        ...shiftingDto,
        createdAt: this.timezoneService.getTimeZone(),
        updatedAt: this.timezoneService.getTimeZone(),
      }).save({ session });

      if (!newShifting)
        throw new BadRequestException(
          'Bad Request, Invalid Data shifting input',
        );

      this.messageService.setMessage('Create Shifting Successfully');
      await session.commitTransaction();

      return newShifting;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    } finally {
      session.endSession();
    }
  }

  async getAllShiftingByGuidInstitution(
    guidInstitution: string,
  ): Promise<Shifting[]> {
    const shifts: Shifting[] = await this.shiftingSchema.find({
      guidInstitution,
    });

    this.messageService.setMessage('Get All Shifting Successfully');

    return shifts;
  }

  async getShiftingByGuid(guid: string): Promise<Shifting> {
    const shift: Shifting = await this.shiftingSchema.findOne({
      guid,
    });

    if (!shift) throw new NotFoundException('Shifting Not Found');

    this.messageService.setMessage('Get Shifting Successfully');

    return shift;
  }

  async updateShiftingByGuid(
    guid: string,
    shiftingDto: ShiftingDto,
  ): Promise<Shifting> {
    const updatedShifting: Shifting =
      await this.shiftingSchema.findOneAndUpdate(
        { guid },
        { ...shiftingDto, updatedAt: this.timezoneService.getTimeZone() },
        { new: true },
      );

    if (!updatedShifting) throw new NotFoundException('Shifting Not Found');

    this.messageService.setMessage('Update Shifting Successfully');

    return updatedShifting;
  }

  async deleteShiftingByGuid(guid: string): Promise<void> {
    const session: ClientSession = await this.shiftingSchema.db.startSession();
    session.startTransaction();

    try {
      const units: Unit[] = await this.unitSchema.find(
        { guidShift: guid },
        {},
        { session },
      );

      if (units.length)
        throw new BadRequestException(
          'Can not delete Shifting, unit is using this shifting',
        );

      const deletedShifting: Shifting =
        await this.shiftingSchema.findOneAndDelete({ guid }, { session });

      if (!deletedShifting) throw new NotFoundException('Shifting Not Found');

      await session.commitTransaction();
      this.messageService.setMessage('Delete Shifting Successfully');
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    } finally {
      session.endSession();
    }
  }
}
