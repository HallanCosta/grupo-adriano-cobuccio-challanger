import { randomUUID } from 'node:crypto';
import {
  type TransactionContext,
  UnitOfWork,
} from '../../../../shared/application/ports/unitOfWork.js';
import type { Account } from '../../../ledger/domain/account.js';
import { AccountType } from '../../../ledger/domain/accountType.js';
import { AccountRepository } from '../../../ledger/domain/ports/accountRepository.js';
import { EmailAlreadyInUseError } from '../../domain/errors/emailAlreadyInUseError.js';
import { PasswordHasher } from '../../domain/ports/passwordHasher.js';
import { UserRepository } from '../../domain/ports/userRepository.js';
import type { NewUser, User } from '../../domain/user.js';
import { RegisterUser } from './registerUser.js';

/** In-memory "database" whose writes only become visible on commit. */
class FakeDatabase {
  users: User[] = [];
  accounts: Account[] = [];
}

type FakeTx = TransactionContext & { users: User[]; accounts: Account[] };

class FakeUnitOfWork extends UnitOfWork {
  constructor(private readonly db: FakeDatabase) {
    super();
  }

  async run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    const tx = {
      users: [...this.db.users],
      accounts: [...this.db.accounts],
    } as unknown as FakeTx;
    const result = await work(tx);
    this.db.users = tx.users;
    this.db.accounts = tx.accounts;
    return result;
  }
}

class FakeUserRepository extends UserRepository {
  async create(user: NewUser, tx: TransactionContext): Promise<User> {
    const { users } = tx as FakeTx;
    if (users.some((existing) => existing.email === user.email)) {
      throw new EmailAlreadyInUseError();
    }
    const now = new Date();
    const created: User = {
      id: randomUUID(),
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    users.push(created);
    return created;
  }
}

class FakeAccountRepository extends AccountRepository {
  failNext = false;

  async openUserWallet(
    userId: string,
    tx: TransactionContext,
  ): Promise<Account> {
    if (this.failNext) {
      throw new Error('account insert failed');
    }
    const account: Account = {
      id: randomUUID(),
      userId,
      type: AccountType.USER_WALLET,
      balance: 0n,
      createdAt: new Date(),
    };
    (tx as FakeTx).accounts.push(account);
    return account;
  }
}

class FakePasswordHasher extends PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `hashed:${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    return hash === `hashed:${plainPassword}`;
  }
}

describe('RegisterUser', () => {
  let db: FakeDatabase;
  let accounts: FakeAccountRepository;
  let registerUser: RegisterUser;

  const validInput = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    password: 's3nha-forte',
  };

  beforeEach(() => {
    db = new FakeDatabase();
    accounts = new FakeAccountRepository();
    registerUser = new RegisterUser(
      new FakeUnitOfWork(db),
      new FakeUserRepository(),
      accounts,
      new FakePasswordHasher(),
    );
  });

  it('creates the user and its USER_WALLET account with balance 0', async () => {
    const result = await registerUser.execute(validInput);

    expect(db.users).toHaveLength(1);
    expect(db.accounts).toEqual([
      expect.objectContaining({
        userId: result.id,
        type: AccountType.USER_WALLET,
        balance: 0n,
      }),
    ]);
  });

  it('stores only the password hash', async () => {
    await registerUser.execute(validInput);

    expect(db.users[0].passwordHash).toBe('hashed:s3nha-forte');
    expect(JSON.stringify(db.users[0])).not.toContain('"password"');
  });

  it('returns id, name, email and createdAt, without the hash', async () => {
    const result = await registerUser.execute(validInput);

    expect(Object.keys(result).sort()).toEqual(
      ['createdAt', 'email', 'id', 'name'].sort(),
    );
    expect(result).toMatchObject({
      name: 'Maria Silva',
      email: 'maria@example.com',
    });
  });

  it('normalizes the email and trims the name', async () => {
    const result = await registerUser.execute({
      ...validInput,
      name: '  Maria Silva ',
      email: '  Maria@Example.COM ',
    });

    expect(result.email).toBe('maria@example.com');
    expect(result.name).toBe('Maria Silva');
    expect(db.users[0].email).toBe('maria@example.com');
  });

  it('rejects an email already taken, with any casing', async () => {
    await registerUser.execute(validInput);

    await expect(
      registerUser.execute({ ...validInput, email: 'MARIA@example.com' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
    expect(db.users).toHaveLength(1);
    expect(db.accounts).toHaveLength(1);
  });

  it('does not persist the user when the wallet cannot be created', async () => {
    accounts.failNext = true;

    await expect(registerUser.execute(validInput)).rejects.toThrow(
      'account insert failed',
    );
    expect(db.users).toHaveLength(0);
    expect(db.accounts).toHaveLength(0);
  });
});
