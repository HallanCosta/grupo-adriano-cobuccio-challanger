import { DomainError } from '@/shared/domain/domainError.js';

/** Same error for an unknown email and a wrong password: no user enumeration. */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly kind = 'unauthorized';

  constructor() {
    super('E-mail ou senha inválidos');
  }
}
