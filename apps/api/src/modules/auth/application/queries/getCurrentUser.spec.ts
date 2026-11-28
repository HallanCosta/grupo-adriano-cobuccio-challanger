import { randomUUID } from 'node:crypto';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import { UserFinder } from '@/modules/auth/domain/ports/userFinder.js';
import type { User } from '@/modules/auth/domain/user.js';
import { GetCurrentUser } from './getCurrentUser.js';

class FakeUserFinder extends UserFinder {
  constructor(private readonly users: User[]) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

describe('GetCurrentUser', () => {
  const now = new Date('2026-11-28T00:00:00.000Z');
  const maria: User = {
    id: randomUUID(),
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: 'hashed:s3nha-forte',
    createdAt: now,
    updatedAt: now,
  };
  const getCurrentUser = new GetCurrentUser(new FakeUserFinder([maria]));

  it('returns the profile without the password hash', async () => {
    const profile = await getCurrentUser.execute(maria.id);

    expect(profile).toEqual({
      id: maria.id,
      name: 'Maria Silva',
      email: 'maria@example.com',
      createdAt: now,
    });
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('treats a user that no longer exists as an invalid session', async () => {
    await expect(getCurrentUser.execute(randomUUID())).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
