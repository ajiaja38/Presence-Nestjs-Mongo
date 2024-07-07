import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [PresenceModule],
  providers: [CronjobsService],
})
export class CronjobsModule {}
