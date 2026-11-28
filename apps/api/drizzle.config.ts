import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// The single .env lives at the repo root; variables already set win.
const rootEnv = new URL('../../.env', import.meta.url);
if (!process.env.DATABASE_URL && existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/infra/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
});
