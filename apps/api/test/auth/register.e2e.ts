import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '@/appModule.js';
import { AccountRepository } from '@/modules/ledger/domain/ports/accountRepository.js';

const validBody = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  password: 's3nha-forte',
};

describe('POST /auth/register (e2e)', () => {
  let app: INestApplication<App>;
  let db: pg.Client;

  beforeAll(async () => {
    db = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();
  });

  afterAll(async () => {
    await db.end();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE accounts, users CASCADE');
  });

  afterEach(async () => {
    await app?.close();
  });

  async function startApp(
    override?: (builder: ReturnType<typeof Test.createTestingModule>) => void,
  ): Promise<void> {
    const builder = Test.createTestingModule({ imports: [AppModule] });
    override?.(builder);
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  const register = (body: object) =>
    request(app.getHttpServer()).post('/auth/register').send(body);

  it('creates the user and a USER_WALLET account with balance 0', async () => {
    await startApp();

    const res = await register({
      ...validBody,
      email: '  Maria@Example.COM ',
    }).expect(201);

    expect(res.body).toEqual({
      id: expect.any(String),
      name: 'Maria Silva',
      email: 'maria@example.com',
      createdAt: expect.any(String),
    });

    const users = await db.query('SELECT id, email, password_hash FROM users');
    expect(users.rows).toHaveLength(1);
    expect(users.rows[0].email).toBe('maria@example.com');
    expect(users.rows[0].password_hash).toMatch(/^\$argon2id\$/);
    expect(users.rows[0].password_hash).not.toContain(validBody.password);

    const accounts = await db.query(
      'SELECT user_id, type, balance FROM accounts',
    );
    expect(accounts.rows).toEqual([
      { user_id: res.body.id, type: 'USER_WALLET', balance: '0' },
    ]);
  });

  it('never returns the password or its hash', async () => {
    await startApp();

    const res = await register(validBody).expect(201);

    expect(res.text).not.toContain(validBody.password);
    expect(res.text).not.toContain('argon2');
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 409 for an email already taken, with any casing', async () => {
    await startApp();
    await register(validBody).expect(201);

    const res = await register({
      ...validBody,
      email: 'MARIA@EXAMPLE.COM',
    }).expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      code: 'EMAIL_ALREADY_IN_USE',
    });
  });

  it('lets only one of several concurrent duplicates through', async () => {
    await startApp();

    const responses = await Promise.all(
      Array.from({ length: 5 }, () => register(validBody)),
    );
    const statuses = responses.map((res) => res.status).sort((a, b) => a - b);

    expect(statuses).toEqual([201, 409, 409, 409, 409]);
    const { rows } = await db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(1);
  });

  it('returns 400 with field errors for invalid input', async () => {
    await startApp();

    const res = await register({
      name: '',
      email: 'not-an-email',
      password: 'short',
    }).expect(400);

    expect(res.body.code).toBe('VALIDATION_FAILED');
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
    const { rows } = await db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(0);
  });

  it('returns 400 when fields are missing', async () => {
    await startApp();

    const res = await register({}).expect(400);

    expect(res.body.errors).toHaveLength(3);
  });

  it('does not persist the user when the wallet creation fails', async () => {
    await startApp((builder) => {
      builder.overrideProvider(AccountRepository).useValue({
        openUserWallet: () => Promise.reject(new Error('boom')),
      });
    });

    await register(validBody).expect(500);

    const { rows } = await db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(0);
  });
});
