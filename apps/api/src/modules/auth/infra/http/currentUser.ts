import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from './authenticatedRequest.js';

/** Injects the user the `AuthGuard` authenticated for this request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new InvalidTokenError();
    }
    return user;
  },
);
