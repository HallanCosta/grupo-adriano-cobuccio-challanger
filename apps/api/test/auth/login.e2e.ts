import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '@/appModule.js';

const credentials = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  password: 's3nha-forte',
};

describe('authentication (e2e)', () => {
  let app: INestApplication<App>;
  let db: pg.Client;

  beforeAll(async () => {
    db = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE accounts, users CASCADE');
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);
  });

  const login = (body: object) =>
    request(app.getHttpServer()).post('/auth/login').send(body);

  const signIn = async (): Promise<{ token: string; userId: string }> => {
    const res = await login({
      email: credentials.email,
      password: credentials.password,
    }).expect(200);
    return { token: res.body.accessToken, userId: res.body.user.id };
  };

  describe('POST /auth/login', () => {
    it('returns a bearer token and the user for valid credentials', async () => {
      const res = await login({
        email: credentials.email,
        password: credentials.password,
      }).expect(200);

      expect(res.body).toEqual({
        accessToken: expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/),
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: expect.any(String),
          name: 'Maria Silva',
          email: 'maria@example.com',
        },
      });
    });

    it('never returns the password or its hash', async () => {
      const res = await login({
        email: credentials.email,
        password: credentials.password,
      }).expect(200);

      expect(res.text).not.toContain(credentials.password);
      expect(res.text).not.toContain('argon2');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('accepts the email with any casing and surrounding spaces', async () => {
      await login({
        email: '  MARIA@Example.com ',
        password: credentials.password,
      }).expect(200);
    });

    it('returns 401 INVALID_CREDENTIALS for a wrong password', async () => {
      const res = await login({
        email: credentials.email,
        password: 'senha-errada',
      }).expect(401);

      expect(res.body).toEqual({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha inválidos',
      });
      expect(res.headers['www-authenticate']).toBe('Bearer');
    });

    it('answers an unknown email exactly like a wrong password', async () => {
      const unknown = await login({
        email: 'ninguem@example.com',
        password: credentials.password,
      }).expect(401);
      const wrongPassword = await login({
        email: credentials.email,
        password: 'senha-errada',
      }).expect(401);

      expect(unknown.body).toEqual(wrongPassword.body);
    });

    it('returns 400 with field errors for invalid input', async () => {
      const res = await login({ email: 'not-an-email', password: '' }).expect(
        400,
      );

      expect(res.body.code).toBe('VALIDATION_FAILED');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          { field: 'email', message: 'E-mail inválido' },
          { field: 'password', message: 'Informe a senha' },
        ]),
      );
    });

    it('returns 400 when fields are missing', async () => {
      const res = await login({}).expect(400);

      expect(res.body.errors).toHaveLength(2);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user for a valid token', async () => {
      const { token, userId } = await signIn();

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual({
        id: userId,
        name: 'Maria Silva',
        email: 'maria@example.com',
        createdAt: expect.any(String),
      });
      expect(res.text).not.toContain('argon2');
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer()).get('/auth/me').expect(401);

      expect(res.body).toMatchObject({ statusCode: 401, code: 'INVALID_TOKEN' });
    });

    it('returns 401 for a malformed token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-jwt')
        .expect(401);
    });

    it('returns 401 for a non-bearer scheme', async () => {
      const { token } = await signIn();

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Basic ${token}`)
        .expect(401);
    });

    it('returns 401 for a token signed with another secret', async () => {
      const { userId } = await signIn();
      const forged = await new JwtService({
        secret: 'another-secret-that-is-also-32-characters-long',
      }).signAsync({ sub: userId });

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });

    it('returns 401 for an expired token', async () => {
      const { userId } = await signIn();
      const expired = await app
        .get(JwtService)
        .signAsync({ sub: userId }, { expiresIn: -10 });

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expired}`)
        .expect(401);
    });

    it('returns 401 when the user behind a valid token no longer exists', async () => {
      const { token } = await signIn();
      await db.query('TRUNCATE accounts, users CASCADE');

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('public routes', () => {
    it.each(['/', '/health', '/metrics'])('%s needs no token', async (path) => {
      await request(app.getHttpServer()).get(path).expect(200);
    });

    it('POST /auth/register needs no token', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...credentials, email: 'joao@example.com' })
        .expect(201);
    });
  });
});
