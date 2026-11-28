import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './appController.js';
import { AppService } from './appService.js';
import { HealthModule } from './health/healthModule.js';
import { MetricsModule } from './metrics/metricsModule.js';
import { DatabaseModule } from './shared/infra/database/databaseModule.js';

const CORRELATION_HEADER = 'x-correlation-id';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ?? (process.env.VITEST ? 'silent' : 'info'),
        genReqId: (req: IncomingMessage, res: ServerResponse) => {
          const header = req.headers[CORRELATION_HEADER];
          const id =
            typeof header === 'string' && header.trim() !== ''
              ? header
              : randomUUID();
          res.setHeader(CORRELATION_HEADER, id);
          return id;
        },
        customProps: (req: IncomingMessage) => ({
          correlationId: (req as IncomingMessage & { id?: string }).id,
        }),
        autoLogging: {
          ignore: (req: IncomingMessage) =>
            req.url === '/metrics' || req.url?.startsWith('/metrics?') === true,
        },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          censor: '[redacted]',
        },
        transport:
          process.env.NODE_ENV === 'production' || process.env.VITEST
            ? undefined
            : {
                target: 'pino-pretty',
                options: { singleLine: true, colorize: true },
              },
      },
    }),
    DatabaseModule,
    HealthModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
