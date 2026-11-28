import { Module } from '@nestjs/common';
import { AccountRepository } from './domain/ports/accountRepository.js';
import { DrizzleAccountRepository } from './infra/persistence/drizzleAccountRepository.js';

@Module({
  providers: [
    { provide: AccountRepository, useClass: DrizzleAccountRepository },
  ],
  exports: [AccountRepository],
})
export class LedgerModule {}
