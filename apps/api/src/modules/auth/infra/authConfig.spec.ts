import { loadAuthConfig } from './authConfig.js';

const secret = 'a-secret-with-at-least-thirty-two-characters';

describe('loadAuthConfig', () => {
  it('reads the secret and the lifetime', () => {
    expect(
      loadAuthConfig({ JWT_SECRET: secret, JWT_EXPIRES_IN: '900' }),
    ).toEqual({ jwtSecret: secret, jwtExpiresInSeconds: 900 });
  });

  it('defaults the lifetime to one hour', () => {
    expect(loadAuthConfig({ JWT_SECRET: secret }).jwtExpiresInSeconds).toBe(
      3600,
    );
  });

  it('fails fast without a secret', () => {
    expect(() => loadAuthConfig({})).toThrow(/JWT_SECRET/);
  });

  it('fails fast with a short secret', () => {
    expect(() => loadAuthConfig({ JWT_SECRET: 'too-short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it.each(['abc', '0', '-5', '1.5'])('rejects the lifetime %j', (value) => {
    expect(() =>
      loadAuthConfig({ JWT_SECRET: secret, JWT_EXPIRES_IN: value }),
    ).toThrow(/JWT_EXPIRES_IN/);
  });
});
