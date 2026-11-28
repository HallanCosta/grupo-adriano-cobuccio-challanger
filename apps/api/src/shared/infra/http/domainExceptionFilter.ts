import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type DomainErrorKind } from '@/shared/domain/domainError.js';

const statusByKind: Record<DomainErrorKind, HttpStatus> = {
  conflict: HttpStatus.CONFLICT,
  notFound: HttpStatus.NOT_FOUND,
  businessRule: HttpStatus.UNPROCESSABLE_ENTITY,
  unauthorized: HttpStatus.UNAUTHORIZED,
};

/** Maps business errors to HTTP. Anything else falls through to Nest. */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = statusByKind[error.kind];

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      response.setHeader('WWW-Authenticate', 'Bearer');
    }

    response.status(statusCode).json({
      statusCode,
      code: error.code,
      message: error.message,
    });
  }
}
