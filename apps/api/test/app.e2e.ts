import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/appModule.js';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('grupo-adriano-cobuccio-api');
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.headers['x-correlation-id']).toBeDefined();
      });
  });

  it('reuses x-correlation-id when provided', () => {
    return request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', 'test-cid-123')
      .expect(200)
      .expect('x-correlation-id', 'test-cid-123');
  });

  it('/metrics (GET)', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect((res) => {
        expect(res.text).toContain('http_requests_total');
        expect(res.text).toContain('process_cpu_user_seconds_total');
      });
  });
});
