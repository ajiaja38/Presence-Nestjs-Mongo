import { Injectable, Logger } from '@nestjs/common';
import { PresenceService } from '../presence/presence.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronjobsService {
  private logger = new Logger(CronjobsService.name);

  constructor(private presenceService: PresenceService) {}

  @Cron('00 00 00 * * *', {
    name: 'Create Daily DefaultPresence',
    timeZone: 'Asia/Jakarta',
  })
  async createDaylyDefaultPresence(): Promise<void> {
    try {
      await this.presenceService.createDailyDefaultPresence();
    } catch (error) {
      this.logger.error(`Error: ${error}`);
    }
  }

  @Cron('00 00 18 * * *', {
    name: 'Checking Fully Presence',
    timeZone: 'Asia/Jakarta',
  })
  async checkingFullyPresence(): Promise<void> {
    try {
      await this.presenceService.checkingFullyPresence();
    } catch (error) {
      this.logger.error(`Error: ${error}`);
    }
  }
}
