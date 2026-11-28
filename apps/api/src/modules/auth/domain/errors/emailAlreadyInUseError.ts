import { DomainError } from '../../../../shared/domain/domainError.js';

export class EmailAlreadyInUseError extends DomainError {
  readonly code = 'EMAIL_ALREADY_IN_USE';
  readonly kind = 'conflict';

  constructor() {
    super('Este e-mail já está cadastrado');
  }
}
