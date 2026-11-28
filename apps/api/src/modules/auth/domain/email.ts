/**
 * Emails are compared case-insensitively, so they are stored trimmed and in
 * lowercase. The database enforces the same rule with a CHECK constraint.
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();
