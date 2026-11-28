/** Who a token speaks for. The only claim the API needs today. */
export type TokenSubject = { userId: string };

export type IssuedToken = {
  accessToken: string;
  /** Lifetime in seconds. */
  expiresIn: number;
};
