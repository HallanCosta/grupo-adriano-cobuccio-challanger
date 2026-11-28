declare const transactionContextBrand: unique symbol;

/**
 * Opaque handle for the database transaction opened by a `UnitOfWork`.
 * Repositories receive it so that every write in a command runs atomically,
 * without the application layer knowing which ORM is behind it.
 */
export type TransactionContext = {
  readonly [transactionContextBrand]: true;
};

export abstract class UnitOfWork {
  /**
   * Runs `work` inside a single transaction. It commits when `work` resolves
   * and rolls back everything when it throws.
   */
  abstract run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
