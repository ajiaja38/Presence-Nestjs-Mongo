import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import 'moment-timezone';

@Injectable()
export class TimezoneService {
  getTimeZone(): string {
    const now: Date = new Date();
    now.setHours(now.getHours() + 7);

    return now.toISOString();
  }

  birthDateStringToDateUtc(birthDate: Date): Date {
    return moment.utc(birthDate, 'YYYY-MM-DD').toDate();
  }

  isSameDate(date1: string, date2: string): boolean {
    const dateOnly1 = moment(date1).tz('Asia/Jakarta').format('YYYY-MM-DD');
    const dateOnly2 = moment(date2).tz('Asia/Jakarta').format('YYYY-MM-DD');

    return dateOnly1 === dateOnly2;
  }

  getCurrentMonth(): string {
    return moment().tz('Asia/Jakarta').format('YYYY-MM');
  }

  getCurrentDay(): number {
    return moment().tz('Asia/Jakarta').day();
  }

  getCurrentFullDate(): string {
    return moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
  }

  getYesterdayFullDate(): string {
    return moment().tz('Asia/Jakarta').subtract(1, 'days').format('YYYY-MM-DD');
  }

  getCurrentTime(): string {
    return moment().tz('Asia/Jakarta').format('HH:mm');
  }

  getFullDateByDateTime(date: string): string {
    return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD');
  }

  getTimeByDateTime(date: string): string {
    return moment(date).tz('Asia/Jakarta').format('HH:mm');
  }

  getStartOfToday(): Date {
    return new Date(`${this.getCurrentFullDate()}T00:00:00.000z`);
  }

  getEndOfToday(): Date {
    return new Date(`${this.getCurrentFullDate()}T23:59:59.999z`);
  }

  getStartOfYesterday(): Date {
    return new Date(
      `${this.getFullDateByDateTime(this.getYesterdayFullDate())}T00:00:00.000z`,
    );
  }

  getEndOfYesterday(): Date {
    return new Date(
      `${this.getFullDateByDateTime(this.getYesterdayFullDate())}T23:59:59.999z`,
    );
  }

  isOnTime(checkInTime: string, checkOutTime: string): boolean {
    return moment(this.getCurrentTime(), 'HH:mm').isBetween(
      moment(checkInTime, 'HH:mm'),
      moment(checkOutTime, 'HH:mm'),
      undefined,
      '[]',
    );
  }
}
