import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MetricsService } from './metrics.service.js';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    const body = await this.metrics.getMetrics();
    res.setHeader('Content-Type', this.metrics.contentType());
    res.send(body);
  }
}
