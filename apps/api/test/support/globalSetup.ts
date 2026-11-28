import pg from 'pg';
import { runMigrations } from '@/shared/infra/database/migrator.js';
import { resolveDatabaseUrls } from './testDatabase.js';

/** Creates the test database if needed and applies the migrations. */
export default async function setup(): Promise<void> {
  const { adminUrl, testUrl } = resolveDatabaseUrls();
  const testDatabase = new URL(testUrl).pathname.replace(/^\//, '');

  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    const { rowCount } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [testDatabase],
    );
    if (rowCount === 0) {
      await admin.query(
        `CREATE DATABASE "${testDatabase.replaceAll('"', '""')}"`,
      );
    }
  } finally {
    await admin.end();
  }

  await runMigrations(testUrl);
}
