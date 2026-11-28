const UNIQUE_VIOLATION = '23505';

type PostgresErrorLike = { code?: unknown; constraint?: unknown };

/**
 * True when `error` (or one of its causes, since Drizzle wraps driver errors)
 * is a Postgres unique violation, optionally on a given constraint.
 */
export const isUniqueViolation = (
  error: unknown,
  constraint?: string,
): boolean => {
  let current: unknown = error;

  for (let depth = 0; depth < 5 && current; depth++) {
    if (typeof current === 'object') {
      const pgError = current as PostgresErrorLike;
      if (pgError.code === UNIQUE_VIOLATION) {
        return constraint === undefined || pgError.constraint === constraint;
      }
    }
    current = (current as { cause?: unknown }).cause;
  }

  return false;
};
