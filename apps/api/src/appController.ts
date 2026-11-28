import { Controller, Get } from '@nestjs/common';
import { AppService, type AppInfo } from './appService.js';
import { Public } from '@/shared/infra/http/public.js';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): AppInfo {
    return this.appService.getInfo();
  }
}
