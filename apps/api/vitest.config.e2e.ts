import { defineConfig } from 'vitest/config';
import { resolveDatabaseUrls } from './test/support/testDatabase.js';

const { testUrl } = resolveDatabaseUrls();

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e.ts'],
    globalSetup: ['./test/support/globalSetup.ts'],
    env: {
      DATABASE_URL: testUrl,
      LOG_LEVEL: 'silent',
      JWT_SECRET: 'e2e-only-secret-that-is-at-least-32-characters-long',
      JWT_EXPIRES_IN: '3600',
    },
    // Suites share one database and clean tables between tests.
    fileParallelism: false,
  },
});
