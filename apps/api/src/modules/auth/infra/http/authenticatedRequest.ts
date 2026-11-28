import type { Request } from 'express';

/** Set by `AuthGuard` once the bearer token checks out. */
export type AuthenticatedUser = { id: string };

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };
