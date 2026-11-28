import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import { TokenVerifier } from '@/modules/auth/domain/ports/tokenVerifier.js';
import { IS_PUBLIC_KEY } from '@/shared/infra/http/public.js';
import type { AuthenticatedRequest } from './authenticatedRequest.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Cross-cutting authentication, registered globally: every route needs a
 * valid bearer token unless it is marked `@Public()`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TokenVerifier) private readonly tokens: TokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new InvalidTokenError();
    }

    const { userId } = await this.tokens.verify(token);
    request.user = { id: userId };
    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string | null {
    const header = request.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) {
      return null;
    }
    const token = header.slice(BEARER_PREFIX.length).trim();
    return token === '' ? null : token;
  }
}
