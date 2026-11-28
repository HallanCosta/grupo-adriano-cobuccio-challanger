import {
  BadRequestException,
  StandardSchemaValidationPipe,
} from '@nestjs/common';

type Issue = {
  message: string;
  path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
};

/**
 * Validates every `@Body({ schema })` / `@Query({ schema })` and answers 400
 * with one entry per invalid field, which the web form shows next to inputs.
 */
export const createValidationPipe = (): StandardSchemaValidationPipe => {
  return new StandardSchemaValidationPipe({
    exceptionFactory: (issues: ReadonlyArray<Issue>) =>
      new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_FAILED',
        message: 'Dados inválidos',
        errors: issues.map((issue) => ({
          field:
            issue.path
              ?.map((segment) =>
                String(typeof segment === 'object' ? segment.key : segment),
              )
              .join('.') ?? '',
          message: issue.message,
        })),
      }),
  });
};
