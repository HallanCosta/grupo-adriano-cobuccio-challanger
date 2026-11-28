import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { TokenSubject } from '@/modules/auth/domain/accessToken.js';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import { TokenVerifier } from '@/modules/auth/domain/ports/tokenVerifier.js';
import type { AuthenticatedRequest } from './authenticatedRequest.js';
import { AuthGuard } from './authGuard.js';

class FakeTokenVerifier extends TokenVerifier {
  verified: string[] = [];

  async verify(token: string): Promise<TokenSubject> {
    this.verified.push(token);
    if (token !== 'valid-token') {
      throw new InvalidTokenError();
    }
    return { userId: 'user-1' };
  }
}

const reflectorReturning = (isPublic: boolean | undefined): Reflector =>
  ({ getAllAndOverride: () => isPublic }) as unknown as Reflector;

const contextFor = (
  request: Partial<AuthenticatedRequest>,
  type = 'http',
): ExecutionContext =>
  ({
    getType: () => type,
    getHandler: () => () => undefined,
    getClass: () => class Routes {},
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const requestWith = (authorization?: string): AuthenticatedRequest =>
  ({ headers: authorization ? { authorization } : {} }) as AuthenticatedRequest;

describe('AuthGuard', () => {
  let verifier: FakeTokenVerifier;

  beforeEach(() => {
    verifier = new FakeTokenVerifier();
  });

  it('lets public routes through without looking at the token', async () => {
    const guard = new AuthGuard(reflectorReturning(true), verifier);

    await expect(guard.canActivate(contextFor(requestWith()))).resolves.toBe(
      true,
    );
    expect(verifier.verified).toHaveLength(0);
  });

  it('accepts a valid bearer token and exposes the user on the request', async () => {
    const guard = new AuthGuard(reflectorReturning(undefined), verifier);
    const request = requestWith('Bearer valid-token');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1' });
  });

  it('rejects a request with no Authorization header', async () => {
    const guard = new AuthGuard(reflectorReturning(false), verifier);

    await expect(
      guard.canActivate(contextFor(requestWith())),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it.each(['Basic abc', 'Bearer', 'Bearer   ', 'valid-token'])(
    'rejects the malformed header %j',
    async (header) => {
      const guard = new AuthGuard(reflectorReturning(false), verifier);

      await expect(
        guard.canActivate(contextFor(requestWith(header))),
      ).rejects.toBeInstanceOf(InvalidTokenError);
      expect(verifier.verified).toHaveLength(0);
    },
  );

  it('rejects a token the verifier does not accept', async () => {
    const guard = new AuthGuard(reflectorReturning(false), verifier);
    const request = requestWith('Bearer forged-token');

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
    expect(request.user).toBeUndefined();
  });

  it('ignores non-http contexts', async () => {
    const guard = new AuthGuard(reflectorReturning(false), verifier);

    await expect(
      guard.canActivate(contextFor(requestWith(), 'rpc')),
    ).resolves.toBe(true);
  });
});
