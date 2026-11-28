import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { normalizeEmail } from '@/modules/auth/domain/email.js';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalidCredentialsError.js';
import { PasswordHasher } from '@/modules/auth/domain/ports/passwordHasher.js';
import { TokenIssuer } from '@/modules/auth/domain/ports/tokenIssuer.js';
import { UserFinder } from '@/modules/auth/domain/ports/userFinder.js';

export type AuthenticateInput = {
  email: string;
  password: string;
};

/** What leaves the command: a token and the public face of the user. */
export type AuthenticatedSession = {
  accessToken: string;
  expiresIn: number;
  user: { id: string; name: string; email: string };
};

/**
 * Checks an email and password and, when they match, issues an access token.
 * It only talks to ports, so hashing and token formats can change without
 * touching this class.
 */
@Injectable()
export class Authenticate {
  private decoyHash?: Promise<string>;

  constructor(
    @Inject(UserFinder) private readonly users: UserFinder,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @Inject(TokenIssuer) private readonly tokens: TokenIssuer,
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticatedSession> {
    const user = await this.users.findByEmail(normalizeEmail(input.email));

    // Verify even when the email is unknown, so both failures cost the same
    // time and a response delay can't reveal which emails are registered.
    const hash = user?.passwordHash ?? (await this.getDecoyHash());
    const passwordMatches = await this.passwordHasher.verify(
      hash,
      input.password,
    );

    if (!user || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const { accessToken, expiresIn } = await this.tokens.issue({
      userId: user.id,
    });

    return {
      accessToken,
      expiresIn,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  private getDecoyHash(): Promise<string> {
    this.decoyHash ??= this.passwordHasher.hash(randomUUID());
    return this.decoyHash;
  }
}
