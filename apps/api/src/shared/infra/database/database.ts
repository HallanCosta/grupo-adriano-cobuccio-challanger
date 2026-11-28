import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { TransactionContext } from '../../application/ports/unitOfWork.js';
import type * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

export type DatabaseTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

/** Unwraps the opaque context handed out by `DrizzleUnitOfWork`. */
export const toDatabaseTransaction = (
  tx: TransactionContext,
): DatabaseTransaction => {
  return tx as unknown as DatabaseTransaction;
};

export const requireDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env at the repo root.',
    );
  }
  return url;
};
