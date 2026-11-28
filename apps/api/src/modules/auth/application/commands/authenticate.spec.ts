import { randomUUID } from 'node:crypto';
import type { IssuedToken, TokenSubject } from '@/modules/auth/domain/accessToken.js';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalidCredentialsError.js';
import { PasswordHasher } from '@/modules/auth/domain/ports/passwordHasher.js';
import { TokenIssuer } from '@/modules/auth/domain/ports/tokenIssuer.js';
import { UserFinder } from '@/modules/auth/domain/ports/userFinder.js';
import type { User } from '@/modules/auth/domain/user.js';
import { Authenticate } from './authenticate.js';

class FakeUserFinder extends UserFinder {
  users: User[] = [];
  lookups: string[] = [];

  async findByEmail(email: string): Promise<User | null> {
    this.lookups.push(email);
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

class FakePasswordHasher extends PasswordHasher {
  verifiedHashes: string[] = [];
  hashCalls = 0;

  async hash(plainPassword: string): Promise<string> {
    this.hashCalls += 1;
    return `hashed:${plainPassword}`;
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    this.verifiedHashes.push(hash);
    return hash === `hashed:${plainPassword}`;
  }
}

class FakeTokenIssuer extends TokenIssuer {
  issued: TokenSubject[] = [];

  async issue(subject: TokenSubject): Promise<IssuedToken> {
    this.issued.push(subject);
    return { accessToken: `token-for:${subject.userId}`, expiresIn: 3600 };
  }
}

describe('Authenticate', () => {
  let users: FakeUserFinder;
  let hasher: FakePasswordHasher;
  let tokens: FakeTokenIssuer;
  let authenticate: Authenticate;
  let maria: User;

  beforeEach(() => {
    users = new FakeUserFinder();
    hasher = new FakePasswordHasher();
    tokens = new FakeTokenIssuer();
    authenticate = new Authenticate(users, hasher, tokens);

    const now = new Date();
    maria = {
      id: randomUUID(),
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: 'hashed:s3nha-forte',
      createdAt: now,
      updatedAt: now,
    };
    users.users.push(maria);
  });

  it('issues a token for the right email and password', async () => {
    const session = await authenticate.execute({
      email: 'maria@example.com',
      password: 's3nha-forte',
    });

    expect(tokens.issued).toEqual([{ userId: maria.id }]);
    expect(session).toEqual({
      accessToken: `token-for:${maria.id}`,
      expiresIn: 3600,
      user: { id: maria.id, name: 'Maria Silva', email: 'maria@example.com' },
    });
  });

  it('normalizes the email before looking the user up', async () => {
    await authenticate.execute({
      email: '  Maria@Example.COM ',
      password: 's3nha-forte',
    });

    expect(users.lookups).toEqual(['maria@example.com']);
  });

  it('never returns the password or its hash', async () => {
    const session = await authenticate.execute({
      email: 'maria@example.com',
      password: 's3nha-forte',
    });

    expect(JSON.stringify(session)).not.toContain('hashed:');
    expect(JSON.stringify(session)).not.toContain('s3nha-forte');
  });

  it('rejects a wrong password without issuing a token', async () => {
    await expect(
      authenticate.execute({ email: 'maria@example.com', password: 'errada!!' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(tokens.issued).toHaveLength(0);
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    const unknown = await authenticate
      .execute({ email: 'ninguem@example.com', password: 's3nha-forte' })
      .catch((error: unknown) => error);
    const wrongPassword = await authenticate
      .execute({ email: 'maria@example.com', password: 'errada!!' })
      .catch((error: unknown) => error);

    expect(unknown).toBeInstanceOf(InvalidCredentialsError);
    expect(wrongPassword).toBeInstanceOf(InvalidCredentialsError);
    expect((unknown as Error).message).toBe((wrongPassword as Error).message);
    expect(tokens.issued).toHaveLength(0);
  });

  it('still verifies a hash for an unknown email, so both failures cost the same', async () => {
    await authenticate
      .execute({ email: 'ninguem@example.com', password: 'qualquer-coisa' })
      .catch(() => undefined);

    expect(hasher.verifiedHashes).toHaveLength(1);
  });

  it('computes the decoy hash only once', async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await authenticate
        .execute({ email: 'ninguem@example.com', password: 'qualquer-coisa' })
        .catch(() => undefined);
    }

    expect(hasher.hashCalls).toBe(1);
    expect(hasher.verifiedHashes).toHaveLength(3);
  });
});
