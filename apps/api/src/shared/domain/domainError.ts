/**
 * What kind of business rule was broken. The HTTP layer maps each kind to a
 * status code, so the domain never needs to know about HTTP.
 */
export type DomainErrorKind =
  | 'conflict'
  | 'notFound'
  | 'businessRule'
  | 'unauthorized';

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly kind: DomainErrorKind;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
