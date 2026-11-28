import type { TransactionContext } from '@/shared/application/ports/unitOfWork.js';
import type { NewUser, User } from '@/modules/auth/domain/user.js';

export abstract class UserRepository {
  /**
   * Inserts the user. Throws `EmailAlreadyInUseError` when the email is
   * taken, including when two requests race for the same email.
   */
  abstract create(user: NewUser, tx: TransactionContext): Promise<User>;
}
