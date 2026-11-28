import type { AccountType } from './accountType.js';

export type Account = {
  id: string;
  /** `null` for system accounts such as EXTERNAL_CASH. */
  userId: string | null;
  type: AccountType;
  /** Integer cents. */
  balance: bigint;
  createdAt: Date;
};
