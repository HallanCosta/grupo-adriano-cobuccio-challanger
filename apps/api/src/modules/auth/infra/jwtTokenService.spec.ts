import { JwtService } from '@nestjs/jwt';
import { InvalidTokenError } from '@/modules/auth/domain/errors/invalidTokenError.js';
import type { AuthConfig } from './authConfig.js';
import { JwtTokenService } from './jwtTokenService.js';

const config: AuthConfig = {
  jwtSecret: 'unit-test-secret-that-is-at-least-32-characters',
  jwtExpiresInSeconds: 3600,
};

const buildService = (overrides: Partial<AuthConfig> = {}): JwtTokenService => {
  const merged = { ...config, ...overrides };
  const jwt = new JwtService({
    secret: merged.jwtSecret,
    signOptions: { algorithm: 'HS256', expiresIn: merged.jwtExpiresInSeconds },
    verifyOptions: { algorithms: ['HS256'] },
  });
  return new JwtTokenService(jwt, merged);
};

describe('JwtTokenService', () => {
  it('issues a token that verifies back to the same user', async () => {
    const service = buildService();

    const { accessToken, expiresIn } = await service.issue({ userId: 'u-1' });

    expect(expiresIn).toBe(3600);
    await expect(service.verify(accessToken)).resolves.toEqual({
      userId: 'u-1',
    });
  });

  it('rejects garbage', async () => {
    await expect(buildService().verify('not-a-jwt')).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it('rejects a token signed with another secret', async () => {
    const other = buildService({
      jwtSecret: 'another-secret-that-is-also-32-characters-long',
    });
    const { accessToken } = await other.issue({ userId: 'u-1' });

    await expect(buildService().verify(accessToken)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it('rejects an expired token', async () => {
    const jwt = new JwtService({ secret: config.jwtSecret });
    const expired = await jwt.signAsync({ sub: 'u-1' }, { expiresIn: -10 });

    await expect(buildService().verify(expired)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it('rejects an unsigned (alg none) token', async () => {
    const encode = (value: object): string =>
      Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: 'u-1' })}.`;

    await expect(buildService().verify(unsigned)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it('rejects a token without a subject', async () => {
    const jwt = new JwtService({ secret: config.jwtSecret });
    const anonymous = await jwt.signAsync({ role: 'admin' });

    await expect(buildService().verify(anonymous)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
