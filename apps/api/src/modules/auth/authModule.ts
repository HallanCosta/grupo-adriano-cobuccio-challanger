import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledgerModule.js';
import { RegisterUser } from './application/commands/registerUser.js';
import { PasswordHasher } from './domain/ports/passwordHasher.js';
import { UserRepository } from './domain/ports/userRepository.js';
import { Argon2PasswordHasher } from './infra/argon2PasswordHasher.js';
import { AuthController } from './infra/http/authController.js';
import { DrizzleUserRepository } from './infra/persistence/drizzleUserRepository.js';

@Module({
  imports: [LedgerModule],
  controllers: [AuthController],
  providers: [
    RegisterUser,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
  ],
})
export class AuthModule {}
