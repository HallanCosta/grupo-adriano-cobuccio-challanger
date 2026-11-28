import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './appController.js';
import { AppService } from './appService.js';
import { HealthModule } from './health/healthModule.js';
import { MetricsModule } from './metrics/metricsModule.js';
import { AuthModule } from './modules/auth/authModule.js';
import { DatabaseModule } from './shared/infra/database/databaseModule.js';
import { DomainExceptionFilter } from './shared/infra/http/domainExceptionFilter.js';
import { createValidationPipe } from './shared/infra/http/validationPipe.js';

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
          // Bodies aren't logged, but never let a password or hash slip in.
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            '*.password',
            '*.passwordHash',
          ],
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
