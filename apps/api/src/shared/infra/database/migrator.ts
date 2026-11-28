import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

/** `apps/api/drizzle`, from both `src/` and `dist/`. */
export const migrationsFolder = path.resolve(
  import.meta.dirname,
  '../../../../drizzle',
);

export const runMigrations = async (databaseUrl: string): Promise<void> => {
  const db = drizzle(databaseUrl);
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await db.$client.end();
  }
};
