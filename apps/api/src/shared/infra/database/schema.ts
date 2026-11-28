import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/*
 * Single source of the database schema, read by drizzle-kit to generate the
 * SQL migrations in `apps/api/drizzle`. Tables live together here because
 * the database is shared by every module.
 */

export const accountType = pgEnum('account_type', [
  'USER_WALLET',
  'EXTERNAL_CASH',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('users_email_unique').on(table.email),
    // Emails are stored normalized, so the unique constraint is
    // case-insensitive in practice even under concurrent requests.
    check('users_email_normalized', sql`email = lower(btrim(email))`),
  ],
);

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'restrict',
    }),
    type: accountType('type').notNull(),
    // Integer cents. The ledger is the source of truth; this is a cache
    // updated in the same transaction as the ledger entries.
    balance: bigint('balance', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // One wallet per user. NULLs (system accounts) don't collide.
    unique('accounts_user_id_unique').on(table.userId),
    check(
      'accounts_owner_matches_type',
      sql`(type = 'USER_WALLET' AND user_id IS NOT NULL) OR (type <> 'USER_WALLET' AND user_id IS NULL)`,
    ),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type AccountRow = typeof accounts.$inferSelect;
