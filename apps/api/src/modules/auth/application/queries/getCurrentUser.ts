import { Inject, Injectable } from '@nestjs/common';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import { UserFinder } from '@/modules/auth/domain/ports/userFinder.js';

export type CurrentUserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

/** Reads the signed-in user. Never exposes the password hash. */
@Injectable()
export class GetCurrentUser {
  constructor(@Inject(UserFinder) private readonly users: UserFinder) {}

  async execute(userId: string): Promise<CurrentUserProfile> {
    const user = await this.users.findById(userId);

    // A valid token for a user that no longer exists is no longer a session.
    if (!user) {
      throw new InvalidTokenError();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
