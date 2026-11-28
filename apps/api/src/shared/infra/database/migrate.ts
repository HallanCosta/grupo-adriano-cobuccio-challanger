import { requireDatabaseUrl } from './database.js';
import { runMigrations } from './migrator.js';

// Entry point used by the `migrate` service in docker-compose:
// `node dist/shared/infra/database/migrate.js`.
await runMigrations(requireDatabaseUrl());
console.log('Migrations applied.');
