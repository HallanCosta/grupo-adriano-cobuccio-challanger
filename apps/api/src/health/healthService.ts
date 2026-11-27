import { Injectable } from '@nestjs/common';
import pg from 'pg';

export type DatabaseHealth = {
  status: 'up' | 'down' | 'skipped';
  latencyMs?: number;
};

export type HealthResult = {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: DatabaseHealth;
};

@Injectable()
export class HealthService {
  async check(): Promise<HealthResult> {
    const database = await this.checkDatabase();
    return {
      status: database.status === 'down' ? 'error' : 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
    };
  }

  private async checkDatabase(): Promise<DatabaseHealth> {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return { status: 'skipped' };
    }

    const client = new pg.Client({
      connectionString: url,
      connectionTimeoutMillis: 2000,
    });
    const started = Date.now();

    try {
      await client.connect();
      await client.query('SELECT 1');
      return { status: 'up', latencyMs: Date.now() - started };
    } catch {
      return { status: 'down', latencyMs: Date.now() - started };
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
