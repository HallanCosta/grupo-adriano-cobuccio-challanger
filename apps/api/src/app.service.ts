import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'grupo-adriano-cobuccio-api',
      endpoints: ['GET /health', 'GET /metrics'],
    };
  }
}
