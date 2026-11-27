import { Module } from '@nestjs/common';
import { HealthController } from './healthController.js';
import { HealthService } from './healthService.js';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
