import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/application/ports/unitOfWork.js';
import { toDatabaseTransaction } from '../../../../shared/infra/database/database.js';
import { isUniqueViolation } from '../../../../shared/infra/database/postgresErrors.js';
import { users } from '../../../../shared/infra/database/schema.js';
import { EmailAlreadyInUseError } from '../../domain/errors/emailAlreadyInUseError.js';
import { UserRepository } from '../../domain/ports/userRepository.js';
import type { NewUser, User } from '../../domain/user.js';

@Injectable()
export class DrizzleUserRepository extends UserRepository {
  async create(user: NewUser, tx: TransactionContext): Promise<User> {
    try {
      const [created] = await toDatabaseTransaction(tx)
        .insert(users)
        .values(user)
        .returning();
      return created;
    } catch (error) {
      // The DB constraint is the real guard: it also catches two concurrent
      // registrations that both passed any application-level check.
      if (isUniqueViolation(error, 'users_email_unique')) {
        throw new EmailAlreadyInUseError();
      }
      throw error;
    }
  }
}
