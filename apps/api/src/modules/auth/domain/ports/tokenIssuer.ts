import type { IssuedToken, TokenSubject } from '@/modules/auth/domain/accessToken.js';

/** Write side of tokens, used when someone signs in. */
export abstract class TokenIssuer {
  abstract issue(subject: TokenSubject): Promise<IssuedToken>;
}
