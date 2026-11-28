import type { User } from '@/modules/auth/domain/user.js';

/**
 * Read side of users. Kept apart from `UserRepository` (writes) so the
 * sign-in flow depends only on the lookups it needs.
 */
export abstract class UserFinder {
  /** `email` must already be normalized (see `normalizeEmail`). */
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}
