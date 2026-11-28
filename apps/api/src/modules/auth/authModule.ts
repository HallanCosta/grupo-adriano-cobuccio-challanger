import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { LedgerModule } from '@/modules/ledger/ledgerModule.js';
import { Authenticate } from './application/commands/authenticate.js';
import { RegisterUser } from './application/commands/registerUser.js';
import { GetCurrentUser } from './application/queries/getCurrentUser.js';
import { PasswordHasher } from './domain/ports/passwordHasher.js';
import { TokenIssuer } from './domain/ports/tokenIssuer.js';
import { TokenVerifier } from './domain/ports/tokenVerifier.js';
import { UserFinder } from './domain/ports/userFinder.js';
import { UserRepository } from './domain/ports/userRepository.js';
import { Argon2PasswordHasher } from './infra/argon2PasswordHasher.js';
import {
  AUTH_CONFIG,
  type AuthConfig,
  AuthConfigModule,
} from './infra/authConfig.js';
import { AuthController } from './infra/http/authController.js';
import { AuthGuard } from './infra/http/authGuard.js';
import { JwtTokenService } from './infra/jwtTokenService.js';
import { DrizzleUserFinder } from './infra/persistence/drizzleUserFinder.js';
import { DrizzleUserRepository } from './infra/persistence/drizzleUserRepository.js';

@Module({
  imports: [
    LedgerModule,
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      inject: [AUTH_CONFIG],
      useFactory: (config: AuthConfig) => ({
        secret: config.jwtSecret,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.jwtExpiresInSeconds,
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUser,
    Authenticate,
    GetCurrentUser,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    { provide: UserFinder, useClass: DrizzleUserFinder },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    JwtTokenService,
    { provide: TokenIssuer, useExisting: JwtTokenService },
    { provide: TokenVerifier, useExisting: JwtTokenService },
    // Global: every route is protected unless it is marked @Public().
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
