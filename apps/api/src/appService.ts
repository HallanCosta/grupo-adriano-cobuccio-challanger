import { Injectable } from '@nestjs/common';

export type AppInfo = {
  name: string;
  endpoints: string[];
};

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return {
      name: 'grupo-adriano-cobuccio-api',
      endpoints: ['GET /health', 'GET /metrics'],
    };
  }
}
