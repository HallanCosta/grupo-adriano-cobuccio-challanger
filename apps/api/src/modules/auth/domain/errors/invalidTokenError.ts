import { DomainError } from '@/shared/domain/domainError.js';

export class InvalidTokenError extends DomainError {
  readonly code = 'INVALID_TOKEN';
  readonly kind = 'unauthorized';

  constructor() {
    super('Sessão inválida ou expirada');
  }
}
