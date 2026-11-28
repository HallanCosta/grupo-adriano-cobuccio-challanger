import { Global, Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UnitOfWork } from '@/shared/application/ports/unitOfWork.js';
import { requireDatabaseUrl } from './database.js';
import { DrizzleUnitOfWork } from './drizzleUnitOfWork.js';
import * as schema from './schema.js';

@Global()
@Module({
  imports: [
    DrizzleModule.forRootAsync({
      // Runs once per application, so each e2e app gets (and closes) its own pool.
      useFactory: () => ({
        db: drizzle({ connection: requireDatabaseUrl(), schema }),
      }),
    }),
  ],
  providers: [{ provide: UnitOfWork, useClass: DrizzleUnitOfWork }],
  exports: [UnitOfWork],
})
export class DatabaseModule {}
