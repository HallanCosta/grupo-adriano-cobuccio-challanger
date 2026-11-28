import { existsSync } from 'node:fs';

/**
 * e2e tests run against a separate database on the same Postgres
 * (`<POSTGRES_DB>_test`), so they never touch development data.
 * Set TEST_DATABASE_URL to point somewhere else.
 */
export function loadRootEnv(): void {
  const rootEnv = new URL('../../../../.env', import.meta.url);
  if (existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  }
}

export function resolveDatabaseUrls(): { adminUrl: string; testUrl: string } {
  loadRootEnv();
  const adminUrl = process.env.DATABASE_URL;
  if (!adminUrl) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and run `pnpm compose:up`.',
    );
  }

  if (process.env.TEST_DATABASE_URL) {
    return { adminUrl, testUrl: process.env.TEST_DATABASE_URL };
  }

  const url = new URL(adminUrl);
  const databaseName = url.pathname.replace(/^\//, '');
  url.pathname = `/${databaseName.endsWith('_test') ? databaseName : `${databaseName}_test`}`;
  return { adminUrl, testUrl: url.toString() };
}
