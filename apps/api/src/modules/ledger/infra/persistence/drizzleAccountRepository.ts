import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/application/ports/unitOfWork.js';
import { toDatabaseTransaction } from '../../../../shared/infra/database/database.js';
import { accounts } from '../../../../shared/infra/database/schema.js';
import type { Account } from '../../domain/account.js';
import { AccountType } from '../../domain/accountType.js';
import { AccountRepository } from '../../domain/ports/accountRepository.js';

@Injectable()
export class DrizzleAccountRepository extends AccountRepository {
  async openUserWallet(
    userId: string,
    tx: TransactionContext,
  ): Promise<Account> {
    const [account] = await toDatabaseTransaction(tx)
      .insert(accounts)
      .values({ userId, type: AccountType.USER_WALLET })
      .returning();

    return account;
  }
}
