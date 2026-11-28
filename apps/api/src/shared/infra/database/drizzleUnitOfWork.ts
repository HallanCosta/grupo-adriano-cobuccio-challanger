import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import {
  type TransactionContext,
  UnitOfWork,
} from '../../application/ports/unitOfWork.js';
import type { Database } from './database.js';

@Injectable()
export class DrizzleUnitOfWork extends UnitOfWork {
  constructor(@InjectDrizzle() private readonly db: Database) {
    super();
  }

  run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) =>
      work(tx as unknown as TransactionContext),
    );
  }
}
