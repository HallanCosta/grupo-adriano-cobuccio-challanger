import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IssuedToken, TokenSubject } from '@/modules/auth/domain/accessToken.js';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import { TokenIssuer } from '@/modules/auth/domain/ports/tokenIssuer.js';
import { TokenVerifier } from '@/modules/auth/domain/ports/tokenVerifier.js';
import { AUTH_CONFIG, type AuthConfig } from './authConfig.js';

/**
 * Adapter that implements both token ports on top of `@nestjs/jwt`
 * (HS256, `sub` = user id). The rest of the app never sees JWT details.
 */
@Injectable()
export class JwtTokenService implements TokenIssuer, TokenVerifier {
  constructor(
    private readonly jwt: JwtService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async issue(subject: TokenSubject): Promise<IssuedToken> {
    const accessToken = await this.jwt.signAsync({ sub: subject.userId });
    return { accessToken, expiresIn: this.config.jwtExpiresInSeconds };
  }

  async verify(token: string): Promise<TokenSubject> {
    let claims: { sub?: unknown };
    try {
      claims = await this.jwt.verifyAsync<{ sub?: unknown }>(token);
    } catch {
      throw new InvalidTokenError();
    }

    if (typeof claims.sub !== 'string' || claims.sub === '') {
      throw new InvalidTokenError();
    }
    return { userId: claims.sub };
  }
}
