import type { TransactionContext } from '@/shared/application/ports/unitOfWork.js';
import type { Account } from '@/modules/ledger/domain/account.js';

export abstract class AccountRepository {
  /** Opens the USER_WALLET account of a user with balance 0. */
  abstract openUserWallet(
    userId: string,
    tx: TransactionContext,
  ): Promise<Account>;
}
