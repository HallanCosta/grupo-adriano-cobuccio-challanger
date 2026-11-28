export const AccountType = {
  /** A user's wallet. Created together with the user at registration. */
  USER_WALLET: 'USER_WALLET',
  /** System account debited by deposits (money coming from outside). */
  EXTERNAL_CASH: 'EXTERNAL_CASH',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];
