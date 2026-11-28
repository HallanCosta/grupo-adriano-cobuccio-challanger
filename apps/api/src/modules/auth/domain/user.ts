export type User = {
  id: string;
  name: string;
  /** Always normalized (trimmed, lowercase). See `normalizeEmail`. */
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = Pick<User, 'name' | 'email' | 'passwordHash'>;
