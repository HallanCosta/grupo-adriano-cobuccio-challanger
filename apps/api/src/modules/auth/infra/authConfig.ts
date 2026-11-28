import { Module } from '@nestjs/common';

export type AuthConfig = {
  jwtSecret: string;
  /** Token lifetime in seconds. */
  jwtExpiresInSeconds: number;
};

export const AUTH_CONFIG = Symbol('AUTH_CONFIG');

const MIN_SECRET_LENGTH = 32;
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

/** Reads and validates the auth settings once, failing fast at startup. */
export const loadAuthConfig = (
  env: NodeJS.ProcessEnv = process.env,
): AuthConfig => {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters. Copy .env.example to .env at the repo root.`,
    );
  }

  const rawExpiresIn = env.JWT_EXPIRES_IN;
  const jwtExpiresInSeconds =
    rawExpiresIn === undefined || rawExpiresIn === ''
      ? DEFAULT_EXPIRES_IN_SECONDS
      : Number(rawExpiresIn);
  if (!Number.isInteger(jwtExpiresInSeconds) || jwtExpiresInSeconds <= 0) {
    throw new Error('JWT_EXPIRES_IN must be a positive number of seconds.');
  }

  return { jwtSecret, jwtExpiresInSeconds };
};

@Module({
  providers: [{ provide: AUTH_CONFIG, useFactory: () => loadAuthConfig() }],
  exports: [AUTH_CONFIG],
})
export class AuthConfigModule {}
