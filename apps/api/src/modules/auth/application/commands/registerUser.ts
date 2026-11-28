import { Inject, Injectable } from '@nestjs/common';
import { UnitOfWork } from '@/shared/application/ports/unitOfWork.js';
import { AccountRepository } from '@/modules/ledger/domain/ports/accountRepository.js';
import { normalizeEmail } from '@/modules/auth/domain/email.js';
import { PasswordHasher } from '@/modules/auth/domain/ports/passwordHasher.js';
import { UserRepository } from '@/modules/auth/domain/ports/userRepository.js';

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

/** What leaves the command: never the password or its hash. */
export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

/**
 * Creates the user and its USER_WALLET account (balance 0) in one
 * transaction: if the wallet can't be created, the user isn't either.
 */
@Injectable()
export class RegisterUser {
  constructor(
    @Inject(UnitOfWork) private readonly unitOfWork: UnitOfWork,
    @Inject(UserRepository) private readonly users: UserRepository,
    @Inject(AccountRepository) private readonly accounts: AccountRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisteredUser> {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    // Hash outside the transaction: it's slow on purpose and needs no DB lock.
    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.unitOfWork.run(async (tx) => {
      const created = await this.users.create(
        { name, email, passwordHash },
        tx,
      );
      await this.accounts.openUserWallet(created.id, tx);
      return created;
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
