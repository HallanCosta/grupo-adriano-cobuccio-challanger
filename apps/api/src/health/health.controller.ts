import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health(@Res({ passthrough: true }) res: Response) {
    const result = await this.healthService.check();
    if (result.status !== 'ok') {
      res.status(503);
    }
    return result;
  }
}
