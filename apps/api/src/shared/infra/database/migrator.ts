import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

/** `apps/api/drizzle`, resolved from the package cwd (`nest start`, Vitest, Docker). */
export const migrationsFolder = path.resolve(process.cwd(), 'drizzle');

export const runMigrations = async (databaseUrl: string): Promise<void> => {
  const db = drizzle(databaseUrl);
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await db.$client.end();
  }
};
