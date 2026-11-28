import type { TokenSubject } from '@/modules/auth/domain/accessToken.js';

/** Read side of tokens, used on every protected request. */
export abstract class TokenVerifier {
  /** Throws `InvalidTokenError` for anything that is not a valid, live token. */
  abstract verify(token: string): Promise<TokenSubject>;
}
